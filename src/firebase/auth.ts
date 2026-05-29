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

export const ADMIN_EMAILS = ['admin@organick.com', 'santexnika.atoyo@gmail.com']
