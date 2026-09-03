import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  FirestoreError,
} from 'firebase/firestore'
import { getDb } from './config'
import { Order, OrderStatus } from '../types'

// Bu fayl `firebase/firestore` ni STATIK import qiladi va shu ataylab:
// uni faqat lazy route'lar (Checkout, UserDashboard, Admin/Dashboard)
// ishlatadi, ya'ni SDK ularning chunk'iga tushadi va bosh sahifaga
// umuman yetib bormaydi. `db` esa endi `getDb()` orqali — config.ts
// dagi izohga qarang.

export const addOrderToFirestore = async (order: Order) => {
  const db = await getDb()
  return setDoc(doc(db, 'orders', order.id), order)
}

export const updateOrderInFirestore = async (orderId: string, status: OrderStatus, adminNote?: string) => {
  const db = await getDb()
  const updates: Partial<Order> = { status }
  if (adminNote !== undefined) updates.adminNote = adminNote
  return updateDoc(doc(db, 'orders', orderId), updates as Record<string, unknown>)
}

/**
 * `getDb()` promise qaytargani uchun obuna bir tik kechikib boshlanadi,
 * lekin chaqiruvchi (useEffect cleanup) unsubscribe'ni DARHOL, sinxron
 * olishi kerak. Shuning uchun bu yordamchi:
 *   - haqiqiy `onSnapshot` unsubscribe'ini kelganda saqlaydi;
 *   - agar komponent SDK yuklanguncha unmount bo'lsa (`cancelled`),
 *     obunani umuman ochmaydi — "zombi" listener qolmaydi.
 */
const subscribeWhenReady = (
  build: (db: Awaited<ReturnType<typeof getDb>>) => () => void,
  onError?: (error: FirestoreError) => void,
) => {
  let unsubscribe: (() => void) | null = null
  let cancelled = false

  getDb()
    .then(db => {
      if (cancelled) return
      unsubscribe = build(db)
    })
    .catch(e => {
      // Firestore SDK chunk'i yuklanmadi (tarmoq/oflayn). Xuddi qoida
      // rad etgandek muomala qilamiz — UI xato holatini ko'rsatadi.
      console.error('[Firestore] SDK yuklanmadi:', e)
      onError?.(e as FirestoreError)
    })

  return () => {
    cancelled = true
    unsubscribe?.()
    unsubscribe = null
  }
}

// Admin uchun: butun kolleksiya. Qoidalar buni faqat `admin: true` claim'i
// bo'lgan foydalanuvchiga ochadi.
export const subscribeAllOrders = (
  callback: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void,
) =>
  subscribeWhenReady(db => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      snapshot => callback(snapshot.docs.map(d => d.data() as Order)),
      error => {
        console.error('[Firestore] subscribeAllOrders:', error)
        onError?.(error)
      },
    )
  }, onError)

// Foydalanuvchi uchun: serverdan FAQAT o'z buyurtmalari keladi.
// Filtr brauzerda emas, so'rovning o'zida — qoidalar ham aynan shu
// `where` shartiga tayanadi (firestore.rules -> orders/read).
//
// Talab qilinadigan composite index: orders (userId ASC, createdAt DESC).
// Eslatma: userId == null bo'lgan mehmon buyurtmalari bu yerga tushmaydi.
export const subscribeUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void,
) =>
  subscribeWhenReady(db => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(
      q,
      snapshot => callback(snapshot.docs.map(d => d.data() as Order)),
      error => {
        console.error('[Firestore] subscribeUserOrders:', error)
        onError?.(error)
      },
    )
  }, onError)
