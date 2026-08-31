import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
