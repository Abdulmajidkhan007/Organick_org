import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

/**
 * Playwright — hozircha FAQAT layout tekshiruvi uchun (`/auth` sahifasi
 * 8 ta kenglikda gorizontal scroll bermasligi kerak).
 *
 * Firebase chaqiruvlari sinalmaydi: ular real proyekt, real SMS va real
 * telefon talab qiladi. Telefon+parol oqimining O'ZINI qo'lda sinash
 * rejasi `docs/QOLDA-SINASH-TELEFON-PAROL.md` da.
 */

// Konteynerda Chromium oldindan o'rnatilgan, lekin Playwright kutgan
// versiya papkasida emas. Bor bo'lsa to'g'ridan-to'g'ri shu faylni
// ishlatamiz, aks holda Playwright o'zi topganini (lokal mashina).
const PREINSTALLED_CHROMIUM = '/opt/pw-browsers/chromium'
const executablePath = existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined

const PORT = 5199
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Telefon+parol UI'si ko'rinishi uchun domen kerak (bo'sh bo'lsa
      // faqat SMS oqimi chiziladi). Bu FAQAT test qiymati.
      VITE_PHONE_AUTH_DOMAIN: 'e2e-pseudo-domain.local',
    },
  },
})
