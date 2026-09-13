import { normalizePhone, isValidPhone as isValidE164Phone } from './phoneAuth'

/** Oddiy shakl tekshiruvi: `x@y.z`. Yetarli — mavjudlikni server/Telegram o'zi tasdiqlaydi. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(String(value || '').trim())

/**
 * Erkin kiritilgan telefon raqami (Checkout kabi, auth emas) to'g'rimi.
 * `normalizePhone` orqali E.164'ga keltiradi, so'ng `phoneAuth.isValidPhone`
 * bilan 9–15 raqam chegarasini (ikki tomonlama) tekshiradi — chegara bir
 * joyda yozilgan, bu yerda qayta yozilmaydi.
 */
export const isValidPhone = (value: string): boolean => isValidE164Phone(normalizePhone(value))
