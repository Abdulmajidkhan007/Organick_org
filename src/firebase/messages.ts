import { getDb } from './config'
import { Message, MessageKind } from '../types'
import type { FirestoreError } from 'firebase/firestore'

/**
 * `messages/{id}` — kontakt murojaatlari va newsletter obunalari.
 *
 * DIQQAT: bu fayl `ContactForm.tsx` va `Footer.tsx` dan chaqiriladi,
 * ikkalasi ham BOSH SAHIFA oqimida (Footer — Home.tsx orqali, statik).
 * Shuning uchun `firestore.ts`/`userProfile.ts`/`catalog.ts` dagidek
 * `firebase/firestore` bu yerda STATIK import QILINMAYDI — u faqat SDK
 * chaqirilganda dinamik yuklanadi (telegram.ts / stock.ts / rating.ts
 * bilan bir xil naqsh). Admin panel (`MessagesTab.tsx`) ham xuddi shu
 * eksportlarni ishlatadi — ular allaqachon lazy route ichida, lekin
 * fayl bitta bo'lgani uchun naqsh baribir dinamik qoladi.
 */

const MAX_TEXT_LENGTH = 4000

/** Matn maydonlarining uzunligini cheklaydi — spam/DoS'ga qarshi birinchi qatlam. */
export const isMessageTextTooLong = (text: string): boolean => text.length > MAX_TEXT_LENGTH

/**
 * Firestore'ga yozadi. Telegram kanali kabi MUSTAQIL: hech qachon throw
 * qilmaydi, qaytgan qiymat "yozildimi" degani. Chaqiruvchi (ContactForm,
 * Footer) buni Telegram natijasidan alohida ko'rsatadi.
 */
export const addMessageToFirestore = async (
  kind: MessageKind,
  payload: Record<string, string>,
): Promise<boolean> => {
  try {
    const [{ collection, doc, setDoc }, db] = await Promise.all([
      import('firebase/firestore'),
      getDb(),
    ])
    await setDoc(doc(collection(db, 'messages')), {
      kind,
      payload,
      createdAt: new Date().toISOString(),
      read: false,
    })
    return true
  } catch (e) {
    console.error('[Messages] Firestore\'ga yozib bo\'lmadi:', e)
    return false
  }
}

/**
 * Admin uchun: butun `messages` kolleksiyasiga obuna (`firestore.ts` dagi
 * `subscribeWhenReady` bilan bir xil g'oya — `getDb()` promise, unsubscribe
 * sinxron qaytadi, komponent SDK yuklanguncha unmount bo'lsa obuna
 * umuman ochilmaydi).
 */
export const subscribeAllMessages = (
  callback: (messages: Message[]) => void,
  onError?: (error: FirestoreError) => void,
): (() => void) => {
  let unsubscribe: (() => void) | null = null
  let cancelled = false

  Promise.all([import('firebase/firestore'), getDb()])
    .then(([{ collection, onSnapshot, orderBy, query }, db]) => {
      if (cancelled) return
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
      unsubscribe = onSnapshot(
        q,
        snapshot => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Message)),
        error => {
          console.error('[Firestore] subscribeAllMessages:', error)
          onError?.(error)
        },
      )
    })
    .catch(e => {
      console.error('[Firestore] SDK yuklanmadi:', e)
      onError?.(e as FirestoreError)
    })

  return () => {
    cancelled = true
    unsubscribe?.()
    unsubscribe = null
  }
}

/** Faqat `read` bayrog'ini yangilaydi — qoidalar (`allow update: if isAdmin()`) shuni kutadi. */
export const markMessageRead = async (id: string, read: boolean): Promise<void> => {
  const [{ doc, updateDoc }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  await updateDoc(doc(db, 'messages', id), { read })
}
