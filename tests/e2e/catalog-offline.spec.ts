import { test, expect } from '@playwright/test'

/**
 * REGRESSIYA: katalog Firestore'ga ko'chgach (12-sessiya), bosh sahifa
 * tarmoqqa BOG'LIQ bo'lib qolmasligi kerak.
 *
 * `App.tsx` mahsulot va bloglarni Firestore REST orqali o'qiydi
 * (`src/firebase/catalogRest.ts`). Bu so'rov yiqilsa — tarmoq yo'q,
 * qoida rad etdi, loyiha ID xato — ekranda kesh, kesh ham bo'lmasa
 * kod ichidagi seed qolishi SHART. Sayt hech qachon bo'sh katalog
 * ko'rsatmasin (CLAUDE.md / src/Data.ts).
 *
 * Bu yerda toza brauzer konteksti ishlatiladi, ya'ni localStorage
 * BO'SH — demak aynan eng yomon holat, "seed'ga qaytish" sinaladi.
 */
test('bosh sahifa — Firestore REST bloklansa ham mahsulotlar ko\'rinadi (seed\'ga qaytish)', async ({ page }) => {
  let blocked = 0

  await page.route('**/firestore.googleapis.com/**', async route => {
    blocked++
    await route.abort()
  })

  await page.goto('/')

  // Seed kataloglarning birinchi mahsuloti (src/Data.ts -> defaultProducts).
  await expect(page.getByRole('heading', { name: 'Calabrese Broccoli', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fresh Banana Fruites', exact: true })).toBeVisible()

  // Bosh sahifada mahsulot kartalari 8 + 4 ta chiziladi (slice(0,8) va
  // slice(12,16)) — ya'ni katalog haqiqatan ham to'liq.
  await expect(page.locator('.productCard')).toHaveCount(12)

  // Rasm yo'li `public/` dan, BARQAROR (hash'siz) bo'lishi kerak: aynan
  // shu yo'l Firestore'ga yoziladi, hash'li URL keyingi deploy'da
  // 404 bo'lardi.
  const firstImg = page.locator('.productCard img').first()
  await expect(firstImg).toHaveAttribute('src', '/shop/CalabreseBroccoli.webp')

  // Test haqiqatan ham REST so'rovini to'sganini tasdiqlaymiz — aks
  // holda u hech narsani sinamay "yashil" bo'lib turaverardi.
  expect(blocked).toBeGreaterThan(0)
})
