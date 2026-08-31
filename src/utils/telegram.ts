/**
 * Telegram guruhiga xabar yuboradi.
 * Hech qachon throw qilmaydi. Qaytaradi: xabar haqiqatan yetib bordimi.
 * `.env` sozlanmagan bo'lsa jimgina `false` qaytaradi (test paytida real
 * guruhga ulanmaslik uchun).
 */
export const sendTelegram = async (text: string, threadIdEnvValue?: string): Promise<boolean> => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const groupId = import.meta.env.VITE_TELEGRAM_GROUP_ID
  if (!botToken || !groupId) return false

  const body: Record<string, unknown> = {
    chat_id: groupId,
    text,
    parse_mode: 'HTML',
  }
  const tid = threadIdEnvValue ? Number(threadIdEnvValue) : 0
  if (tid > 0) body.message_thread_id = tid

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Telegram]', err)
      return false
    }
    return true
  } catch (e) {
    console.error('[Telegram network error]', e)
    return false
  }
}
