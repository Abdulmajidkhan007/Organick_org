import { test, expect } from '@playwright/test'

/**
 * /dashboard ga kirmagan holda kirilganda "kirish kerak" ekrani chiqishi
 * va profil formasi (Ism/Manzillar/Parol) UMUMAN ko'rinmasligi kerak.
 *
 * Regressiya: profil tab'i (`UserDashboard.tsx` -> `ProfileTab`) faqat
 * `user` bor bo'lganda render qilinadi (kod `if (!user) return ...` bilan
 * ertaroq chiqib ketadi). Bu test Firebase'ga umuman ulanmaydi — sof
 * layout/guard tekshiruvi, xuddi `auth-layout.spec.ts` kabi.
 */
test('/dashboard — kirmagan foydalanuvchiga "kirish kerak" chiqadi, profil forma ko\'rinmaydi', async ({ page }) => {
  await page.goto('/dashboard')

  const loginRequiredHeading = page.getByRole('heading', { name: "Buyurtmalarni ko'rish uchun tizimga kiring" })
  await expect(loginRequiredHeading).toBeVisible()
  // Navbar'da ham "Kirish" tugmasi bor, shuning uchun faqat shu ekrandagi
  // (sarlavha bilan bir ota ichidagi) tugmani tekshiramiz.
  await expect(loginRequiredHeading.locator('..').getByRole('button', { name: 'Kirish' })).toBeVisible()

  // Profil tab'i tugmasi, ism/manzil maydonlari — hech biri chiqmasligi kerak.
  await expect(page.getByRole('button', { name: /^Profil$/ })).toHaveCount(0)
  await expect(page.getByPlaceholder("To'liq ismingiz")).toHaveCount(0)
  await expect(page.getByText('Manzillarim')).toHaveCount(0)
  await expect(page.getByText('Parolni o\'zgartirish')).toHaveCount(0)
})
