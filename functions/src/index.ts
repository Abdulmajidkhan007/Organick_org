import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

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

  await db.runTransaction(async tx => {
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
