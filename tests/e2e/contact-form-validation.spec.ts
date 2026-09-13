import { test, expect } from '@playwright/test'

/**
 * /contact formasi noto'g'ri email bilan yuborilganda:
 *   1. Maydon tagida xato matni ko'rinishi kerak,
 *   2. `sendTelegram` (demak Cloud Function chaqiruvi) UMUMAN
 *      bajarilmasligi kerak — avval `handleSend` shu yerda to'xtashi shart.
 *
 * Ilgari <form> yo'q, tugma type="button" edi, `type="email"` atributi
 * hech narsa qilmasdi va "ali2." kabi qiymat sendTelegram'gacha o'tib
 * ketardi (`src/utils/validate.ts` qo'shilishidan oldingi holat).
 */
test('/contact — notogri email: xato korsatiladi va sendTelegram chaqirilmaydi', async ({ page }) => {
  const functionCalls: string[] = []
  await page.route('**/*sendTelegramMessage*', route => {
    functionCalls.push(route.request().url())
    route.abort()
  })

  await page.goto('/contact')

  await page.getByPlaceholder('Ismingiz').fill('Test User')
  await page.getByPlaceholder('misol@email.com').fill('ali2.')
  await page.getByPlaceholder('Salom, men... haqida gaplashmoqchiman').fill('Salom, bu test xabari.')

  await page.getByRole('button', { name: 'Xabar yuborish' }).click()

  await expect(page.getByText("Email manzil noto'g'ri formatda")).toBeVisible()
  expect(functionCalls).toHaveLength(0)
})
