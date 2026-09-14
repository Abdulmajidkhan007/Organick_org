import { test, expect, Page } from '@playwright/test'

/**
 * BUG: yon menyudagi "Buyurtmalar" ikonkasi yonida `pendingCount === 0`
 * bo'lganda yolg'iz "0" matni chizilardi — `{item.badge && item.badge > 0 && (...)}`
 * ifodasi `badge` 0 bo'lganda `0` ni qaytaradi va React uni matn qilib
 * chizadi (`src/Components/Admin/Dashboard.tsx`, `!!item.badge` bilan tuzatildi).
 *
 * /admin ga kirish uchun haqiqiy admin claim/parol kerak, buni esa CLAUDE.md
 * bo'yicha e2e sinamaydi (real loyiha va real SMS/parol kerak). Shuning
 * uchun bu yerda FAQAT Firebase Auth'ning ikkita REST chaqiruvi (parol bilan
 * kirish + accounts:lookup) tarmoq darajasida soxta javob bilan almashtiriladi
 * — `admin: true` claim'i soxta ID token ichida, `checkIsAdmin()` uni
 * tarmoqqa chiqmasdan (`getIdTokenResult`) lokal o'qiydi, xuddi haqiqiy
 * custom claim kabi. Firestore'ga ULANMAYMIZ (loyiha ID'si `.env'siz muhitda
 * baribir soxta, `subscribeAllOrders` xatoga uchraydi va `orders` bo'sh
 * qoladi) — bu ayni "buyurtma yo'q" holatini tabiiy ravishda beradi.
 */

const FAKE_UID = 'e2e-admin-uid'
const FAKE_EMAIL = 'e2e-admin@example.com'
const FAKE_PASSWORD = 'e2e-test-password-1'

const base64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')

const fakeAdminIdToken = () => {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url({ alg: 'none', typ: 'JWT' })
  const payload = base64url({
    admin: true,
    sub: FAKE_UID,
    user_id: FAKE_UID,
    iat: now,
    auth_time: now,
    exp: now + 3600,
    email: FAKE_EMAIL,
    firebase: { sign_in_provider: 'password' },
  })
  return `${header}.${payload}.e2e-fake-signature`
}

const mockAdminAuth = async (page: Page) => {
  await page.route('**/identitytoolkit.googleapis.com/**', async route => {
    const req = route.request()
    const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

    if (req.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      })
      return
    }

    const url = req.url()

    if (url.includes('accounts:signInWithPassword')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: FAKE_UID,
          email: FAKE_EMAIL,
          displayName: 'E2E Admin',
          idToken: fakeAdminIdToken(),
          registered: true,
          refreshToken: 'e2e-fake-refresh-token',
          expiresIn: '3600',
        }),
      })
      return
    }

    if (url.includes('accounts:lookup')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [{
            localId: FAKE_UID,
            email: FAKE_EMAIL,
            displayName: 'E2E Admin',
            emailVerified: true,
            providerUserInfo: [{ providerId: 'password', email: FAKE_EMAIL }],
            passwordHash: 'e2e-fake-hash',
            createdAt: String(Date.now()),
            lastLoginAt: String(Date.now()),
          }],
        }),
      })
      return
    }

    await route.continue()
  })
}

test('/admin — buyurtma yo\'q holatda yon menyuda yolg\'iz "0" chizilmaydi', async ({ page }) => {
  await mockAdminAuth(page)

  await page.goto('/auth')
  await page.getByRole('button', { name: /Email orqali kirish/i }).click()
  await page.getByPlaceholder('email@example.com').fill(FAKE_EMAIL)
  await page.getByPlaceholder('Parolingiz').fill(FAKE_PASSWORD)
  await page.locator('form button[type="submit"]').click()

  // Kirish muvaffaqiyatli bo'lsa AuthPage bosh sahifaga o'tkazadi — bu
  // token/hisob soxta javobdan to'g'ri o'qilganini tasdiqlaydi.
  await expect(page).toHaveURL('/')

  // /admin ga to'g'ridan-to'g'ri o'tamiz (Firebase sessiyasi shu brauzer
  // kontekstida saqlanadi, qayta login shart emas).
  await page.goto('/admin')

  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()

  const sidebar = page.locator('aside.admin-sidebar')
  await expect(sidebar).toBeVisible()

  // Firestore'ga ulanish muvaffaqiyatsiz (soxta loyiha ID'si), ya'ni
  // `orders` bo'sh — bu aynan "buyurtma yo'q" holati.
  const navText = (await sidebar.locator('nav').innerText()).trim()
  expect(navText.split(/\s+/)).not.toContain('0')
})
