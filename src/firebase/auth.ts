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
import { auth } from './config'

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
