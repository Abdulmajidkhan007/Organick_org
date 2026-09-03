import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// DIQQAT: `firebase/firestore` bu yerda FAQAT tip sifatida import qilinadi
// (`import type` — kompilyatsiyada butunlay o'chib ketadi). Haqiqiy modul
// `getDb()` ichida dinamik yuklanadi, pastdagi izohga qarang.
import type { Firestore } from 'firebase/firestore'

// getAuth() throws synchronously (crashing the whole module import chain, which
// leaves #root empty before React ever mounts) when apiKey is missing/empty —
// e.g. no .env file at all. Fall back to a syntactically-valid placeholder so
// init never throws; real auth calls still fail (and are already caught) async.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'missing-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'missing.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'missing-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:0:web:0000000000000000000000',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  console.error(
    'Firebase env kalitlari topilmadi (.env faylini tekshiring) — placeholder qiymatlar bilan ishga tushmoqda, Auth/Firestore ishlamaydi.'
  )
}

const app = initializeApp(firebaseConfig)

// Auth KECHIKTIRILMAYDI: Navbar har sahifada foydalanuvchi holatini
// ko'rsatadi va `App.tsx` darhol `onAuthStateChanged` ga obuna bo'ladi.
export const auth = getAuth(app)

/**
 * Firestore SDK'ni KECHIKTIRIB yuklaydi.
 *
 * Ilgari bu yerda `export const db = getFirestore(app)` turardi. U modul
 * yuklanishida bajarilgani uchun `@firebase/firestore` (+ u olib keladigan
 * `re2js`) har bir sahifaning boshlang'ich bundle'iga tushardi — bosh
 * sahifa uchun ~1.4 MB raw ortiqcha yuk, holbuki Firestore faqat
 * /checkout, /dashboard va /admin da kerak.
 *
 * Endi SDK birinchi marta chaqirilganda tarmoqdan olinadi va natija
 * keshlanadi (bir marta yuklanadi, keyingi chaqiruvlar bir xil
 * `Firestore` nusxasini qaytaradi).
 *
 * Xato bo'lsa promise keshdan chiqariladi, ya'ni tarmoq tiklanganda
 * keyingi urinish yana ishlaydi.
 */
let dbPromise: Promise<Firestore> | null = null

export const getDb = (): Promise<Firestore> => {
  if (!dbPromise) {
    dbPromise = import('firebase/firestore')
      .then(m => m.getFirestore(app))
      .catch(e => {
        dbPromise = null
        throw e
      })
  }
  return dbPromise
}

export default app
