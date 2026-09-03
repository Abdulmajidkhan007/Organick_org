import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  RecaptchaVerifier,
  ConfirmationResult,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  updateProfile,
  getIdTokenResult,
  User,
} from 'firebase/auth'
import { auth, getDb } from './config'
import { isPseudoEmail, isReservedAuthEmail, phoneToPseudoEmail } from '../utils/phoneAuth'
import { AuthUser } from '../types'

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = async (email: string, password: string, name: string) => {
  // Telefon+parol oqimi ishlatadigan psevdo-domenni bu yerdan BLOKLAYMIZ.
  // Aks holda hujumchi birovning raqamidan yasalgan manzilni oldindan band
  // qilib, haqiqiy egasiga parol qo'yish imkonini bermay qo'yadi
  // (`src/utils/phoneAuth.ts` dagi to'liq izoh). Tekshiruv AuthPage'da ham
  // bor — u yerda mijozga tushunarli xabar chiqadi; bu esa oqimning
  // o'zini qo'riqlaydi, ya'ni yangi chaqiruvchi qo'shilsa ham teshik ochilmaydi.
  if (isReservedAuthEmail(email)) {
    throw Object.assign(new Error('Bu email domeni bilan ro\'yxatdan o\'tib bo\'lmaydi'), {
      code: 'auth/reserved-email-domain',
    })
  }
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

/**
 * TELEFON RAQAM + PAROL bilan kirish.
 *
 * Ichkarida bu oddiy `signInWithEmailAndPassword`, faqat email raqamdan
 * yasaladi (`src/utils/phoneAuth.ts` dagi izohga qarang). SMS ketmaydi —
 * butun maqsad shu.
 *
 * `phoneE164` — `normalizePhone()` dan o'tgan raqam bo'lishi SHART.
 */
export const signInWithPhonePassword = (phoneE164: string, password: string) =>
  signInWithEmailAndPassword(auth, phoneToPseudoEmail(phoneE164), password)

/**
 * SMS OTP dan endigina o'tgan foydalanuvchiga PAROL biriktiradi.
 *
 * Ikki holatni ham qoplaydi:
 *   - hisobda hali `password` provayderi yo'q  -> `linkWithCredential`
 *     (ro'yxatdan o'tish, va eski "faqat SMS" hisoblar uchun ham)
 *   - allaqachon bor                            -> `updatePassword`
 *     (parolni tiklash)
 *
 * `updatePassword` "yaqinda kirgan" bo'lishni talab qiladi — bu funksiya
 * doim OTP tasdiqlangandan keyin darhol chaqirilgani uchun shart bajarilgan.
 *
 * Email raqamdan yasaladi, foydalanuvchi kiritgan qiymatdan EMAS: shunda
 * hisobga faqat o'z raqamining psevdo-emaili tushadi.
 *
 * Xatolar `throw` qilinadi (`auth/email-already-in-use` va boshqalar) —
 * ularni AuthPage tushunarli xabarga aylantiradi.
 */
export const attachPasswordToPhoneUser = async (user: User, password: string) => {
  if (!user.phoneNumber) {
    // Bu yerga faqat kod xatosi bilan tushiladi: oqim OTP dan keyin
    // chaqiriladi, ya'ni raqam albatta bor.
    throw Object.assign(new Error('Foydalanuvchida telefon raqam yo\'q'), {
      code: 'auth/missing-phone-number',
    })
  }

  const alreadyHasPassword = user.providerData.some(p => p.providerId === 'password')
  if (alreadyHasPassword) {
    await updatePassword(user, password)
    return
  }

  const credential = EmailAuthProvider.credential(
    phoneToPseudoEmail(user.phoneNumber),
    password,
  )
  await linkWithCredential(user, credential)
}

/**
 * Firebase `User` -> Redux'dagi `AuthUser`.
 *
 * YAGONA joyda turishi MUHIM: aynan shu yerda telefon+parol oqimi yasagan
 * psevdo-email (`998901234567@<domen>`) `null` ga aylantiriladi. Aks holda
 * u Navbar'da, foydalanuvchi panelida, admin panelida va buyurtmaning
 * `userEmail` maydonida mijozga ko'rinib qolardi.
 *
 * Ikki chaqiruvchi bor va ikkalasi ham shu funksiyadan o'tishi kerak:
 * `App.tsx` (`onAuthStateChanged`) va `AuthPage` (ism saqlangandan keyin —
 * `updateProfile` `onAuthStateChanged` ni ishga tushirmaydi).
 */
export const toAuthUser = (user: User, isAdmin: boolean): AuthUser => ({
  uid: user.uid,
  email: isPseudoEmail(user.email) ? null : user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  phoneNumber: user.phoneNumber,
  isAdmin,
})

/** Ro'yxatdan o'tish oxirida ism saqlash uchun (telefon oqimida). */
export const updateDisplayName = (user: User, name: string) =>
  updateProfile(user, { displayName: name })

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
  //
  // Firestore SDK shu yerda DINAMIK yuklanadi. Sabab: bu fayl `App.tsx`
  // va `Navbar.tsx` orqali har sahifada ishlatiladi — statik import
  // butun `@firebase/firestore` ni bosh sahifa bundle'iga tortardi.
  // Bu tarmoq so'rovi allaqachon 1-qadam `false` qaytargandagina,
  // ya'ni claim'i bor admin uchun HECH QACHON bajarilmaydi.
  //
  // Xatolar tarkibi o'zgarmadi: modul yuklanmasa ham, qoida rad etsa ham
  // natija `false` (fail-closed) — bu funksiya throw qilmaydi.
  try {
    const [db, { doc, getDoc }] = await Promise.all([
      getDb(),
      import('firebase/firestore'),
    ])
    const snap = await getDoc(doc(db, 'admins', user.uid))
    return snap.exists()
  } catch (e) {
    console.error('[Firebase] admins/{uid} hujjati o\'qilmadi:', e)
    return false
  }
}
