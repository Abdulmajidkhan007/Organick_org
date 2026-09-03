import { test, expect, Page } from '@playwright/test'

/**
 * /auth sahifasi HECH BIR kenglikda gorizontal scroll bermasligi kerak.
 *
 * Nega aynan shu tekshiruv: telefon+parol oqimida sahifaga yangi
 * elementlar qo'shildi — ikkita yonma-yon havola ("SMS bilan kirish" /
 * "Parolni unutdingizmi?"), uzunroq tab yozuvlari va uzun xato xabarlari.
 * Ular tor ekranda oson toshib ketadi, toshsa esa butun sahifa yon
 * tomonga suriladi.
 */

const WIDTHS = [320, 360, 375, 390, 414, 480, 768, 1024]

/** Sahifa eniga sig'dimi? `documentElement.scrollWidth` — eng ishonchli
 *  o'lchov: absolute/fixed elementlar ham unga qo'shiladi. */
const horizontalOverflow = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement
    return el.scrollWidth - el.clientWidth
  })

/**
 * Qo'shimcha diagnostika: qaysi element o'ng chegaradan chiqib turibdi.
 *
 * Ikki holat ataylab HISOBGA OLINMAYDI, chunki ular sahifani surmaydi:
 *   - `position: fixed` elementlar (masalan yopiq `.cart-sidebar`,
 *     u `right: -400px` da turadi) — fixed element hujjat scroll'iga
 *     umuman qo'shilmaydi;
 *   - `overflow-x` kesib turgan ota element ichidagilar — ular o'z
 *     konteyneri ichida qirqiladi.
 */
const widestOverflowingElement = (page: Page) =>
  page.evaluate(() => {
    const limit = document.documentElement.clientWidth

    const isClippedOrFixed = (el: Element | null): boolean => {
      for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
        const style = getComputedStyle(node)
        if (style.position === 'fixed') return true
        if (style.overflowX !== 'visible') return true
      }
      return false
    }

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || Math.round(r.right) <= limit + 1) continue
      if (isClippedOrFixed(el)) continue
      return `${el.tagName.toLowerCase()}.${String(el.className || '').slice(0, 60)} right=${Math.round(r.right)} limit=${limit}`
    }
    return null
  })

const assertNoHorizontalScroll = async (page: Page, label: string) => {
  expect(await widestOverflowingElement(page), `${label}: element chegaradan chiqdi`).toBeNull()
  expect(await horizontalOverflow(page), `${label}: sahifada gorizontal scroll bor`).toBe(0)
}

for (const width of WIDTHS) {
  test(`/auth ${width}px — gorizontal scroll yo'q`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/auth')

    // Kirish + telefon — sahifa ochilishidagi standart holat.
    // Bu yerda parol maydonining borligi ayni paytda telefon+parol
    // oqimi YOQILGANINI ham tasdiqlaydi (config'dagi test domeni).
    await expect(page.getByRole('button', { name: 'Telefon + parol' })).toBeVisible()
    await expect(page.locator('input[autocomplete="tel"]')).toBeVisible()
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'SMS bilan kirish' })).toBeVisible()
    await assertNoHorizontalScroll(page, `${width}px kirish/telefon`)

    // Ro'yxatdan o'tish + telefon: qo'shimcha "ism" maydoni va SMS izohi
    await page.getByRole('button', { name: "Ro'yxatdan o'tish", exact: true }).first().click()
    await assertNoHorizontalScroll(page, `${width}px royxat/telefon`)

    // Ro'yxatdan o'tish + email: eng ko'p maydonli holat
    await page.getByRole('button', { name: /Email orqali kirish/i }).click()
    await assertNoHorizontalScroll(page, `${width}px royxat/email`)

    // Uzun xato xabari ham sahifani kengaytirmasin
    await page.getByRole('button', { name: "Ro'yxatdan o'tish", exact: true }).last().click()
    await expect(page.locator('.text-red-600').first()).toBeVisible()
    await assertNoHorizontalScroll(page, `${width}px xato xabari`)
  })
}
