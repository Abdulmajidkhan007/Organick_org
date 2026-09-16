import { test, expect } from '@playwright/test'

/**
 * REGRESSIYA: Checkout.tsx `handleOrder()` ichida
 *   `stockOk = await applyOrderStock(id)`
 * hech qanday `try/catch` bilan o'ralmagan — `src/utils/stock.ts` ning
 * o'zi HECH QACHON throw qilmasligiga tayanadi (telegram.ts bilan bir
 * xil naqsh). Agar bu shart buzilsa, Cloud Function chaqiruvi
 * yiqilganda (tarmoq yo'q, funksiya hali deploy qilinmagan, va h.k.)
 * butun `handleOrder()` async funksiyasi yiqiladi va mijoz "buyurtma
 * qabul qilindi" ekranini UMUMAN ko'rmay qoladi — garchi Firestore'ga
 * buyurtma allaqachon yozilgan bo'lsa ham.
 *
 * Nega to'liq Checkout UI oqimi emas: bu sinov `firestoreOk === true`
 * holatini talab qiladi (Checkout.tsx `applyOrderStock`ni FAQAT
 * Firestore'ga buyurtma yozilgandan keyin chaqiradi). Haqiqiy Firestore
 * YOZISH (setDoc) backend'ning haqiqiy tasdiqlashini kutadi — bu
 * konteynerda (real loyiha yo'q, chiquvchi HTTPS proxy orqali,
 * sertifikat ishonchi yo'q) soxtalashtirib bo'lmaydi, va CLAUDE.md /
 * playwright.config.ts allaqachon belgilagan: "Firebase chaqiruvlari
 * sinalmaydi" (faqat layout va oflayn-zaxira ssenariylari sinaladi).
 * Shuning uchun bu sinov to'g'ridan-to'g'ri `src/utils/stock.ts` dagi
 * `applyOrderStock`ni — aynan Checkout.tsx chaqiradigan HAQIQIY modulni
 * (Vite dev-server orqali, mock emas) — chaqiradi va Cloud Function
 * so'rovini `route.abort()` bilan to'sadi.
 */
test('applyOrderStock — Cloud Function chaqiruvi tosilganda throw qilmaydi, false qaytaradi va xato jim yutilmaydi', async ({ page }) => {
  let blocked = 0
  const consoleErrors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.route('**/*applyOrderStock*', async route => {
    blocked++
    await route.abort()
  })

  await page.goto('/')

  // Checkout.tsx aynan shu importni ishlatadi:
  //   import { applyOrderStock } from '../utils/stock'
  // Shuning uchun mock emas — HAQIQIY modul, Vite dev-server orqali.
  const result = await page.evaluate(async () => {
    // @ts-expect-error — Vite dev-server .ts faylni ESM sifatida beradi
    const mod = await import('/src/utils/stock.ts')
    return mod.applyOrderStock('E2E-FAKE-ORDER-ID')
  })

  // 1) Throw QILMADI (aks holda yuqoridagi `page.evaluate` promise
  //    rad etilib, bu test allaqachon xato bilan yiqilgan bo'lardi).
  // 2) `false` qaytardi — Checkout.tsx buni `delivery.stockOk = false`
  //    qilib saqlaydi va mijozga `checkout.stockWarning` ko'rsatadi.
  expect(result).toBe(false)

  // Chaqiruv haqiqatan ham to'silgani tasdiqlanadi — aks holda test
  // hech narsani sinamay "yashil" bo'lib turaverardi.
  expect(blocked).toBeGreaterThan(0)

  // Xato JIM YUTILMAYDI — `src/utils/stock.ts` uni `console.error`ga
  // yozadi ("[Stock] ..."), Checkout.tsx buni qayta yozmasa ham
  // (UI'da alohida ko'rsatiladi), texnik jurnalda iz qoladi.
  expect(consoleErrors.some(t => t.includes('[Stock]'))).toBe(true)
})
