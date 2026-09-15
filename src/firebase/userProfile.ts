import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDb } from './config'
import { UserProfile } from '../types'

// `firestore.ts` bilan bir xil naqsh: bu fayl `firebase/firestore` ni STATIK
// import qiladi, chunki uni faqat lazy route'lar (UserDashboard, Checkout)
// ishlatadi — bosh sahifa bundle'iga tegmaydi.

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const db = await getDb()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export const saveUserProfile = async (uid: string, data: Partial<Omit<UserProfile, 'updatedAt'>>): Promise<void> => {
  const db = await getDb()
  await setDoc(
    doc(db, 'users', uid),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}
