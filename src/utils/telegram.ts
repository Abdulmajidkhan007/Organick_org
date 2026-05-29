export const sendTelegram = (text: string, threadIdEnvValue?: string): Promise<Response | void> => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const groupId = import.meta.env.VITE_TELEGRAM_GROUP_ID
  if (!botToken || !groupId) return Promise.resolve()

  const body: Record<string, unknown> = {
    chat_id: groupId,
    text,
    parse_mode: 'HTML',
  }
  const tid = threadIdEnvValue ? Number(threadIdEnvValue) : 0
  if (tid > 0) body.message_thread_id = tid

  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
