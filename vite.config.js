import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Bir modul qaysi vendor guruhiga tegishli — shu yerda hal qilinadi.
 *
 * DIQQAT — nega firebase IKKI guruhga bo'lingan:
 * manual chunk "kerak bo'lganda" emas, "ichidagi biror modul kerak
 * bo'lganda BUTUNLAY" yuklanadi. Agar `@firebase/auth` va
 * `@firebase/firestore` bitta guruhda bo'lsa, bosh sahifa auth uchun
 * o'sha chunk'ni so'raydi va firestore (+ re2js, ~555 kB) ham u bilan
 * birga kelib qoladi — ya'ni butun code-splitting bekor bo'lardi.
 * Shuning uchun:
 *   firebase-auth      — bosh sahifada ham kerak (Navbar, onAuthStateChanged)
 *   firebase-firestore — faqat /checkout, /auth, /dashboard, /admin
 */
const VENDOR_GROUPS = {
  'firebase-firestore': ['@firebase/firestore', '@firebase/webchannel-wrapper', 're2js'],
  'firebase-auth': ['@firebase/auth', '@firebase/app', '@firebase/util', '@firebase/component', '@firebase/logger', 'idb'],
  'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom', 'react-redux', '@reduxjs/toolkit', 'redux', 'redux-thunk', 'immer', 'reselect', 'use-sync-external-store', 'scheduler'],
  ui: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'void-elements', 'html-parse-stringify'],
}

// Ro'yxatlarni bir marta teskari xaritaga aylantiramiz: paket -> guruh.
const GROUP_OF_PACKAGE = new Map(
  Object.entries(VENDOR_GROUPS).flatMap(([group, packages]) => packages.map(p => [p, group])),
)

const chunkForModule = (id) => {
  const parts = id.replace(/\\/g, '/').split('node_modules/')
  if (parts.length < 2) return undefined // loyihaning o'z kodi — route bo'yicha bo'linadi
  // Eng oxirgi (eng ichki) `node_modules/` bo'yicha, ya'ni nested
  // bog'liqlik ham o'zining guruhiga tushadi, ota-paketnikiga emas.
  const pkg = parts[parts.length - 1].match(/^((?:@[^/]+\/)?[^/]+)/)?.[1]
  return pkg ? GROUP_OF_PACKAGE.get(pkg) : undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Eng katta chunk — `firebase-firestore` (~555 kB). U ATAYLAB katta va
    // ATAYLAB lazy: bosh sahifa uni umuman so'ramaydi. 500 kB ogohlantirishi
    // shu bitta chunk uchun har build'da chiqib turmasligi kerak.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: chunkForModule,
      },
    },
  },
})
