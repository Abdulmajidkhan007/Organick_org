import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Transaction } from 'firebase-admin/firestore'

initializeApp()

// Token va guruh ID — haqiqiy sirlar, Secret Manager'da.
const TELEGRAM_BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN')
const TELEGRAM_GROUP_ID = defineSecret('TELEGRAM_GROUP_ID')

// Thread ID'lar o'zi sir emas (guruh ichidagi mavzu raqamlari, token'siz
// foydasiz), lekin ular ham defineSecret() orqali saqlanadi: shunday qilinsa
// bitta Cloud Shell skripti (docs/DEPLOY.md) hammasini bir yo'la sozlaydi va
// GitHub Actions'ga qo'shimcha secret/`.env` yozish qadami kerak bo'lmaydi.
// Mavzu o'zgarsa ham faqat Secret Manager'dagi qiymat yangilanadi — kod
// qayta deploy qilinmaydi.
const TELEGRAM_THREAD_ID_NEWSLETTER = defineSecret('TELEGRAM_THREAD_ID_NEWSLETTER')
const TELEGRAM_THREAD_ID_CONTACT = defineSecret('TELEGRAM_THREAD_ID_CONTACT')
const TELEGRAM_THREAD_ID_ORDERS = defineSecret('TELEGRAM_THREAD_ID_ORDERS')

type SendKind = 'newsletter' | 'contact' | 'order'
const VALID_KINDS: SendKind[] = ['newsletter', 'contact', 'order']

// Telegram xabar limiti ~4096 belgi; biroz zaxira bilan kesamiz.
const MAX_TEXT_LENGTH = 4000

// Suiiste'mol himoyasi: IP bo'yicha limit (App Check emas).
//
// Bu funksiyani MEHMONLAR (auth'siz) chaqiradi — newsletter va kontakt
// formalari kirishni talab qilmaydi, buyurtma ham mehmon sifatida beriladi.
// Shuning uchun `request.auth` ga tayanib bo'lmaydi.
//
// App Check o'rniga IP-limit tanlandi:
//   - App Check reCAPTCHA Enterprise/v3 saytini Firebase Console'da yoqishni,
//     yangi VITE_ kalit (site key) qo'shishni va App Check'ni yoqib
//     "Enforce" rejimiga o'tkazishni talab qiladi — bu loyiha egasi uchun
//     yana bir CLI'siz-lekin-ko'p-qadamli Console sozlashi (va App Check
//     debug token bilan lokal test qilishni ham murakkablashtiradi).
//   - IP-limit esa funksiya kodining o'zida, qo'shimcha Console qadamisiz
//     ishlaydi — faqat Secret Manager qadam (allaqachon shart) yetarli.
//   - Kamchiligi: IP soxtalashtirilishi yoki umumiy NAT orqasida bir nechta
//     odam bitta IP'ni baham ko'rishi mumkin — bu App Check'dan zaifroq, ammo
//     bu loyiha (kichik do'kon, kunlik oqim past) uchun yetarli va kelajakda
//     App Check'ga o'tish kod tuzilishini buzmaydi.
//
// Firestore'da yoziladi (Admin SDK orqali) — bu `firestore.rules`'ga
// TEGMAYDI: Admin SDK qoidalardan mutlaqo chetlab o'tadi.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 daqiqa
const RATE_LIMIT_MAX = 5 // bitta IP'dan oyna ichida eng ko'pi 5 ta xabar

const checkRateLimit = async (ip: string): Promise<void> => {
  const db = getFirestore()
  const docId = ip.replace(/[^\w.:-]/g, '_').slice(0, 200) || 'unknown'
  const ref = db.collection('_telegramRateLimits').doc(docId)
  const now = Date.now()

  await db.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(ref)
    const data = snap.exists ? (snap.data() as { count: number; windowStart: number }) : null

    if (!data || now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now })
      return
    }

    if (data.count >= RATE_LIMIT_MAX) {
      throw new HttpsError('resource-exhausted', "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring.")
    }

    tx.update(ref, { count: FieldValue.increment(1) })
  })
}

const clientIp = (rawRequest: { ip?: string; headers: Record<string, string | string[] | undefined> }): string => {
  const forwarded = rawRequest.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim()
  return rawRequest.ip || 'unknown'
}

const threadIdFor = (kind: SendKind): string => {
  switch (kind) {
    case 'newsletter': return TELEGRAM_THREAD_ID_NEWSLETTER.value()
    case 'contact': return TELEGRAM_THREAD_ID_CONTACT.value()
    case 'order': return TELEGRAM_THREAD_ID_ORDERS.value()
  }
}

export const sendTelegramMessage = onCall(
  {
    secrets: [
      TELEGRAM_BOT_TOKEN,
      TELEGRAM_GROUP_ID,
      TELEGRAM_THREAD_ID_NEWSLETTER,
      TELEGRAM_THREAD_ID_CONTACT,
      TELEGRAM_THREAD_ID_ORDERS,
    ],
  },
  async request => {
    const data = request.data as { text?: unknown; kind?: unknown }
    const text = typeof data.text === 'string' ? data.text.trim() : ''
    const kind = data.kind as SendKind

    if (!text) throw new HttpsError('invalid-argument', "Xabar matni bo'sh bo'lishi mumkin emas.")
    if (text.length > MAX_TEXT_LENGTH) throw new HttpsError('invalid-argument', 'Xabar matni juda uzun.')
    if (!VALID_KINDS.includes(kind)) throw new HttpsError('invalid-argument', "Noto'g'ri yo'nalish (kind).")

    await checkRateLimit(clientIp(request.rawRequest))

    const body: Record<string, unknown> = {
      chat_id: TELEGRAM_GROUP_ID.value(),
      text,
      parse_mode: 'HTML',
    }
    const threadId = Number(threadIdFor(kind))
    if (threadId > 0) body.message_thread_id = threadId

    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN.value()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        logger.error('[Telegram]', err)
        return { ok: false }
      }
      return { ok: true }
    } catch (e) {
      logger.error('[Telegram network error]', e)
      return { ok: false }
    }
  },
)

// ============================================================================
// ZAXIRA (stock) va REYTING — atomik, Admin SDK orqali.
//
// `firestore.rules`: `products` -> `write: if isAdmin()`. Buni kengaytirib
// bo'lmaydi (aks holda katalogni har kim tahrirlaydi), shuning uchun mijoz
// tomonidan kerak bo'ladigan ikkita yozish (buyurtmadan keyin zaxirani
// kamaytirish, reyting qo'yish) shu ikki Cloud Function orqali keladi —
// Admin SDK qoidalardan chetlab o'tadi, lekin funksiyaning o'zi qat'iy
// tekshiradi (nima yoziladi va qancha). To'liq sabab:
// docs/ARXITEKTURA-TARIXI.md.
// ============================================================================

interface OrderItemData {
  productId: number
  quantity: number
}

/**
 * Buyurtma berilgandan keyin zaxirani kamaytiradi. Mehmon ham chaqira
 * oladi — buyurtmani kirmagan mijoz ham beradi, shuning uchun
 * `request.auth` talab qilinmaydi.
 *
 * XAVFSIZLIK: funksiya faqat `orderId` qabul qiladi, `items`NI EMAS.
 * Kamaytiriladigan miqdor FAQAT `orders/{orderId}` hujjatidan o'qiladi —
 * mijoz o'zi qancha va qaysi mahsulot deb aytishi mumkin emas. Shu
 * sababli soxta so'rov bilan zaxirani nolga tushirib bo'lmaydi (ko'pi
 * bilan o'sha buyurtmadagi haqiqiy miqdorlar qo'llaniladi, va faqat bir
 * marta — pastga qarang).
 *
 * IDEMPOTENT: `orders/{orderId}.stockApplied === true` bo'lsa hech narsa
 * qilmaydi. Bu ikki sabab uchun kerak: (1) mijoz tarmoq sekinligida
 * tugmani ikki marta bosishi yoki chaqiruv qayta urinishi mumkin,
 * (2) shu bilan bir xil buyurtma uchun zaxira ikki marta kamaymaydi.
 */
export const applyOrderStock = onCall(async request => {
  const data = request.data as { orderId?: unknown }
  const orderId = typeof data.orderId === 'string' ? data.orderId.trim() : ''
  if (!orderId) throw new HttpsError('invalid-argument', "Buyurtma ID'si kiritilmagan.")

  const db = getFirestore()
  const orderRef = db.collection('orders').doc(orderId)

  return db.runTransaction(async (tx: Transaction) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists) {
      throw new HttpsError('not-found', "Bunday buyurtma topilmadi.")
    }

    const order = orderSnap.data() as { items?: OrderItemData[]; stockApplied?: boolean }
    if (order.stockApplied === true) {
      return { ok: true, alreadyApplied: true }
    }

    const items = Array.isArray(order.items) ? order.items : []

    // Transaction qoidasi: HAMMA o'qish yozishdan OLDIN bo'lishi shart.
    const productRefs = items.map(i => db.collection('products').doc(String(i.productId)))
    const productSnaps = productRefs.length > 0 ? await Promise.all(productRefs.map(ref => tx.get(ref))) : []

    productSnaps.forEach((snap, idx) => {
      if (!snap.exists) return
      const quantity = items[idx].quantity
      if (typeof quantity !== 'number' || !(quantity > 0)) return
      const currentStock = (snap.data() as { stock?: number }).stock
      // Manfiy bo'lmasin — bir necha mijoz bir vaqtda buyurtma bersa ham.
      const newStock = Math.max(0, (currentStock ?? 0) - quantity)
      tx.update(snap.ref, { stock: newStock })
    })

    tx.update(orderRef, { stockApplied: true })
    return { ok: true, alreadyApplied: false }
  })
})

const MIN_RATING = 1
const MAX_RATING = 5

/**
 * Mahsulotga baho qo'yadi/yangilaydi. Kirmagan foydalanuvchi chaqira
 * olmaydi (`unauthenticated`) — reyting kim tomonidan qo'yilgani
 * (`request.auth.uid`) shu yerda aniqlanadi, mijoz o'zi uid yubormaydi.
 *
 * O(1): butun `ratings` sub-kolleksiyasi qayta sanalmaydi. `products/{id}`
 * hujjatida ikkita hisoblagich saqlanadi — `ratingSum` va `ratingCount` —
 * va har chaqiruvda faqat shu ikkitasi yangilanadi:
 *   newSum   = (ratingSum || 0)   - (eskiBaho || 0) + rating
 *   newCount = (ratingCount || 0) + (eskiBaho bo'lmasa 1, aks holda 0)
 * `Product.rating` (mavjud, sxema o'zgarmagan maydon) — shu ikkitadan
 * hisoblangan o'rtacha, yaxlitlangan.
 *
 * `products/{id}/ratings/{uid}` hujjati eski bahoni bilish uchun kerak
 * (qayta baholaganda eskisini `newSum`dan ayirish uchun). Bu
 * sub-kolleksiyaga `firestore.rules`da QASDDAN alohida qoida YO'Q: unga
 * faqat shu Admin SDK yozadi (qoidalardan chetlab o'tadi), mijoz esa uni
 * umuman o'qimaydi/yozmaydi — fayl oxiridagi `match /{document=**}`
 * (hamma narsa yopiq) uni ham qamrab oladi. To'liq sabab:
 * docs/ARXITEKTURA-TARIXI.md.
 */
export const rateProduct = onCall(async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', "Baho qo'yish uchun tizimga kirish kerak.")
  const uid = request.auth.uid

  const data = request.data as { productId?: unknown; rating?: unknown }
  const productId = typeof data.productId === 'number' ? data.productId : Number(data.productId)
  const rating = typeof data.rating === 'number' ? data.rating : NaN

  if (!Number.isFinite(productId)) throw new HttpsError('invalid-argument', "Mahsulot ID'si noto'g'ri.")
  if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
    throw new HttpsError('invalid-argument', "Baho 1 dan 5 gacha butun son bo'lishi kerak.")
  }

  const db = getFirestore()
  const productRef = db.collection('products').doc(String(productId))
  const ratingRef = productRef.collection('ratings').doc(uid)

  return db.runTransaction(async (tx: Transaction) => {
    const [productSnap, ratingSnap] = await Promise.all([tx.get(productRef), tx.get(ratingRef)])
    if (!productSnap.exists) throw new HttpsError('not-found', 'Bunday mahsulot topilmadi.')

    const product = productSnap.data() as { ratingSum?: number; ratingCount?: number }
    const previous = ratingSnap.exists ? (ratingSnap.data() as { rating?: number }).rating : undefined

    const newSum = (product.ratingSum || 0) - (previous || 0) + rating
    const newCount = (product.ratingCount || 0) + (previous ? 0 : 1)
    const newRating = Math.round(newSum / newCount)

    tx.update(productRef, { ratingSum: newSum, ratingCount: newCount, rating: newRating })
    tx.set(ratingRef, { rating, date: new Date().toISOString() })

    return { rating: newRating, ratingSum: newSum, ratingCount: newCount }
  })
})
