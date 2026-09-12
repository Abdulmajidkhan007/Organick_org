import { getFunctionsInstance } from '../firebase/config'

export type TelegramMessageKind = 'newsletter' | 'contact' | 'order'

/**
 * Telegram guruhiga xabar yuboradi — Cloud Function (`sendTelegramMessage`)
 * orqali. Bot tokeni endi brauzerda umuman yo'q, faqat Secret Manager'da
 * (`functions/src/index.ts`).
 * Hech qachon throw qilmaydi. Qaytaradi: xabar haqiqatan yetib bordimi.
 * `kind` — qaysi Telegram mavzusiga (thread) borishini funksiya tanlaydi.
 */
export const sendTelegram = async (text: string, kind: TelegramMessageKind): Promise<boolean> => {
  if (!text.trim()) return false

  try {
    const [{ httpsCallable }, functions] = await Promise.all([import('firebase/functions'), getFunctionsInstance()])
    const call = httpsCallable<{ text: string; kind: TelegramMessageKind }, { ok: boolean }>(functions, 'sendTelegramMessage')
    const res = await call({ text, kind })
    return Boolean(res.data?.ok)
  } catch (e) {
    console.error('[Telegram]', e)
    return false
  }
}
