import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
  getIdTokenResult,
  User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: name })
  return result
}

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  })
}

export const sendPhoneOTP = (phone: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> =>
  signInWithPhoneNumber(auth, phone, recaptchaVerifier)

export const signOutUser = () => signOut(auth)

/**
 * Admin huquqi Firebase custom claim'idan (`{ admin: true }`) o'qiladi.
 * Claim ID token ichida serverda imzolanadi — uni brauzerda yoki Redux
 * devtools'da o'zgartirib bo'lmaydi, va aynan shu claim'ga
 * `firestore.rules` ham tayanadi. Ya'ni bu endi UI to'sig'i emas.
 *
 * `forceRefresh` — claim yangi berilgan bo'lsa kerak bo'ladi: aks holda
 * eski token keshda 1 soatgacha yashaydi.
 */
export const hasAdminClaim = async (user: User, forceRefresh = false): Promise<boolean> => {
  try {
    const token = await getIdTokenResult(user, forceRefresh)
    return token.claims.admin === true
  } catch (e) {
    console.error('[Firebase Auth] ID token claims o\'qilmadi:', e)
    return false
  }
}

/**
 * Admin huquqining YAKUNIY tekshiruvi — ikki manba, shu tartibda:
 *
 *   1. Custom claim `{ admin: true }` — TEZ yo'l. Token allaqachon
 *      brauzerda, tarmoq so'rovi ham, Firestore o'qishi ham yo'q.
 *   2. `admins/{uid}` hujjati — ZAXIRA yo'l. Faqat 1-qadam `false`
 *      qaytarganda o'qiladi, ya'ni claim'i bor admin uchun bu
 *      so'rov (va uning narxi) hech qachon yuborilmaydi.
 *
 * Aynan shu tartib `firestore.rules` dagi `isAdmin()` bilan bir xil.
 *
 * Xato bo'lsa (tarmoq yo'q, qoidalar rad etdi, Firestore yiqildi) —
 * `false` qaytadi (fail-closed) va konsolga yoziladi. Bu funksiya
 * HECH QACHON throw qilmaydi: `App.tsx` uni `onAuthStateChanged`
 * ichida kutadi, throw esa oq ekran bilan tugardi.
 *
 * Eslatma: bu qiymat baribir FAQAT UI uchun. Haqiqiy chegara
 * `firestore.rules` ichida — uni Redux devtools'da o'zgartirish
 * ma'lumotga yo'l ochmaydi.
 */
export const checkIsAdmin = async (user: User): Promise<boolean> => {
  // 1) Claim — arzon va tez.
  if (await hasAdminClaim(user)) return true

  // 2) Zaxira: admins/{uid} hujjati bormi?
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid))
    return snap.exists()
  } catch (e) {
    console.error('[Firebase] admins/{uid} hujjati o\'qilmadi:', e)
    return false
  }
}
