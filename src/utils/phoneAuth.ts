/**
 * TELEFON RAQAM + PAROL bilan kirish uchun yordamchi funksiyalar.
 *
 * =================== NEGA "PSEVDO-EMAIL" ===================
 * Firebase Auth'da "telefon + parol" degan provayder YO'Q. Bor narsalar:
 *   - `phone`    — faqat SMS OTP (parolsiz), har kirishda SMS ketadi
 *   - `password` — email + parol
 *
 * Shuning uchun mijoz BIR MARTA SMS bilan tasdiqdan o'tadi, keyin o'sha
 * hisobga `password` provayderi BIRIKTIRILADI (`linkWithCredential`).
 * O'sha provayder talab qiladigan email telefon raqamdan yasaladi:
 *
 *   +998 90 123 45 67  ->  998901234567@<domen>
 *
 * Bu emailga hech qachon hech narsa yuborilmaydi (tasdiqlash xati ham,
 * parol tiklash xati ham) — u faqat Firebase ichidagi KALIT. Mijoz uni
 * ko'rmaydi: UI'da "telefon raqam + parol" deb ko'rinadi, va `App.tsx`
 * psevdo-emailni Redux'ga umuman yozmaydi (`isPseudoEmail` bilan
 * filtrlanadi), ya'ni u Navbar'da ham, buyurtmada ham chiqmaydi.
 *
 * =================== DOMEN NEGA ENV'DAN ===================
 * Hujum: agar domen taxmin qilinadigan bo'lsa (masalan `@organick.local`),
 * hujumchi oddiy email ro'yxatdan o'tish formasi orqali
 * `998901234567@organick.local` ni OLDINDAN band qilib oladi. Keyin o'sha
 * raqamning haqiqiy egasi SMS'dan o'tsa ham, `linkWithCredential`
 * "email-already-in-use" bilan yiqiladi — ya'ni egasi o'z raqamiga
 * parol qo'ya olmaydi (hisob bloklanadi).
 *
 * Uchta to'siq qo'yilgan, ULARNING KUCHI BIR XIL EMAS:
 *
 *   1. Domen `VITE_PHONE_AUTH_DOMAIN` env'idan keladi va tasodifiy
 *      bo'lishi kerak (masalan `openssl rand -hex 8` + `.local`).
 *      BU FAQAT "OBSKURLIK". Frontend-only ilovada u HAQIQIY SIR EMAS:
 *      brauzer psevdo-emailni o'zi yasashi shart, demak domen bundle
 *      ichida ochiq matn sifatida turadi va uni topsa bo'ladi.
 *      Shuning uchun u CLAUDE.md dagi "yangi maxfiy kalit VITE_ bilan
 *      qo'shilmaydi" qoidasiga zid emas — bu sir emas, konfiguratsiya.
 *
 *   2. Oddiy email ro'yxatdan o'tish formasi shu domen bilan tugaydigan
 *      manzillarni BLOKLAYDI (`isReservedAuthEmail`). Bizning formadan
 *      hujum qilishning yo'li shu bilan yopiladi.
 *
 *   3. QOLGAN XAVF (hal qilinmagan, server kerak): Firebase'ning
 *      `signUp` REST endpoint'i ochiq va API kalit ham ochiq, ya'ni
 *      1-2 to'siqni bilgan hujumchi bizning formani chetlab o'tib
 *      to'g'ridan-to'g'ri hisob yarata oladi. Buni FAQAT server tomon
 *      to'xtatadi: Firebase Auth "blocking function"
 *      (`beforeUserCreated`) — psevdo-domen bilan kelgan har qanday
 *      ro'yxatdan o'tishni rad etsin. Namuna:
 *      `docs/XAVFSIZLIK-MIGRATSIYA.md` -> "Telefon+parol".
 *
 * =================== DOMENNI KEYIN O'ZGARTIRMANG ===================
 * Domen — barcha mavjud parollarning bir qismi. Uni o'zgartirsangiz
 * har bir mijozning psevdo-emaili ham o'zgaradi va HAMMASI paroli
 * bilan kira olmay qoladi (SMS bilan kirish ishlaydi, keyin parolni
 * qaytadan qo'yishga to'g'ri keladi). Shu sabab: env berilmagan bo'lsa
 * bu modul telefon+parolni JIMGINA zaxira domen bilan ishlatmaydi —
 * `isPhonePasswordEnabled()` `false` qaytaradi va UI faqat SMS
 * oqimini ko'rsatadi. Aks holda env keyinroq qo'shilganda hamma
 * "sabab yo'q" holda paroldan ayrilardi.
 */

/** 9 xonali lokal raqam kiritilsa (`901234567`) shu kod qo'shiladi. */
const DEFAULT_COUNTRY_CODE = '998'

const RAW_DOMAIN = String(import.meta.env.VITE_PHONE_AUTH_DOMAIN || '')
  .trim()
  .toLowerCase()
  .replace(/^@/, '')

/** Domen haqiqiy domenga o'xshaydimi (`abc123.local` kabi). */
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/

export const PHONE_AUTH_DOMAIN = DOMAIN_RE.test(RAW_DOMAIN) ? RAW_DOMAIN : ''

/**
 * Telefon+parol oqimi yoqilganmi. `false` bo'lsa AuthPage faqat SMS
 * bilan kirishni ko'rsatadi — mavjud xatti-harakat, hech narsa buzilmaydi.
 */
export const isPhonePasswordEnabled = (): boolean => PHONE_AUTH_DOMAIN !== ''

if (!PHONE_AUTH_DOMAIN) {
  console.warn(
    '[Auth] VITE_PHONE_AUTH_DOMAIN berilmagan (yoki formati noto\'g\'ri) — ' +
      'telefon+parol o\'chirilgan, faqat SMS bilan kirish ishlaydi. ' +
      '.env.example ga qarang.'
  )
}

/**
 * Foydalanuvchi kiritgan raqamni E.164 ko'rinishiga keltiradi.
 *
 * Bu funksiya DETERMINISTIK bo'lishi SHART: ro'yxatdan o'tish va kirish
 * bir xil psevdo-email yasashi kerak, aks holda mijoz o'z parolini
 * kirita turib ham kira olmaydi.
 *
 *   "+998 90 123-45-67" -> "+998901234567"
 *   "998901234567"      -> "+998901234567"
 *   "00998901234567"    -> "+998901234567"
 *   "901234567"         -> "+998901234567"   (9 xonali = lokal raqam)
 *   ""                  -> ""
 */
export const normalizePhone = (raw: string): string => {
  const hadPlus = String(raw || '').trim().startsWith('+')
  let digits = String(raw || '').replace(/\D/g, '')

  if (!hadPlus) {
    if (digits.startsWith('00')) digits = digits.slice(2)
    else if (digits.length === 9) digits = DEFAULT_COUNTRY_CODE + digits
  }

  return digits ? `+${digits}` : ''
}

/** E.164 raqam ko'rinishga to'g'rimi (mamlakat kodi bilan 9–15 raqam). */
export const isValidPhone = (phoneE164: string): boolean =>
  /^\+[1-9]\d{8,14}$/.test(phoneE164)

/**
 * Raqamdan Firebase `password` provayderi uchun psevdo-email yasaydi.
 * Kirish `normalizePhone` dan o'tgan bo'lishi kerak.
 */
export const phoneToPseudoEmail = (phoneE164: string): string => {
  if (!PHONE_AUTH_DOMAIN) {
    throw new Error('VITE_PHONE_AUTH_DOMAIN sozlanmagan')
  }
  const digits = String(phoneE164 || '').replace(/\D/g, '')
  if (!digits) throw new Error('Telefon raqam bo\'sh')
  return `${digits}@${PHONE_AUTH_DOMAIN}`
}

/**
 * Bu email biz yasagan psevdo-emailmi? UI'da ko'rsatmaslik uchun
 * (`App.tsx` uni Redux'ga `null` qilib yozadi).
 */
export const isPseudoEmail = (email: string | null | undefined): boolean => {
  if (!email || !PHONE_AUTH_DOMAIN) return false
  return email.trim().toLowerCase().endsWith(`@${PHONE_AUTH_DOMAIN}`)
}

/**
 * Oddiy email ro'yxatdan o'tish formasi uchun BLOKLASH tekshiruvi
 * (yuqoridagi 2-to'siq). Domen sozlanmagan bo'lsa ham ishlaydi:
 * ehtiyot uchun `.local` va `.invalid` bilan tugaydigan manzillar ham
 * rad etiladi — ular RFC bo'yicha internetda mavjud bo'lmaydi, ya'ni
 * haqiqiy mijozning emaili hech qachon shunday tugamaydi.
 */
export const isReservedAuthEmail = (email: string): boolean => {
  const value = String(email || '').trim().toLowerCase()
  if (!value) return false
  if (PHONE_AUTH_DOMAIN && value.endsWith(`@${PHONE_AUTH_DOMAIN}`)) return true
  return /\.(local|invalid|internal|localhost)$/.test(value)
}

/** Parol uchun eng kam uzunlik — telefon+parol oqimida ham, email'da ham. */
export const MIN_PASSWORD_LENGTH = 8

export const isStrongEnoughPassword = (password: string): boolean =>
  String(password || '').length >= MIN_PASSWORD_LENGTH
