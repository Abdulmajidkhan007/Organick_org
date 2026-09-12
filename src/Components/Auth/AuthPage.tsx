import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  setupRecaptcha,
  sendPhoneOTP,
  signInWithPhonePassword,
  attachPasswordToPhoneUser,
  updateDisplayName,
  toAuthUser,
} from '../../firebase/auth'
import { auth } from '../../firebase/config'
import { setUser } from '../../slices/authSlice'
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth'
import {
  MIN_PASSWORD_LENGTH,
  isPhonePasswordEnabled,
  isReservedAuthEmail,
  isValidPhone,
  normalizePhone,
} from '../../utils/phoneAuth'
import logo from '../../assets/logo.webp'

type AuthMode = 'login' | 'register'
type AuthMethod = 'phone' | 'email'

/** Telefon oqimining qadami. */
type PhoneStep = 'input' | 'otp' | 'password'

/**
 * SMS nima uchun so'ralgan. Kod tasdiqlangandan KEYIN qayerga borish
 * shu qiymat bilan hal qilinadi — uchala oqim ham bir xil OTP ekranini
 * ishlatadi, faqat davomi boshqacha:
 *   register — parol yaratish ekraniga
 *   reset    — parolni almashtirish ekraniga (aynan shu ekran)
 *   signin   — to'g'ridan-to'g'ri bosh sahifaga (parolsiz, eski oqim)
 */
type OtpIntent = 'register' | 'reset' | 'signin'

/**
 * Firebase xato kodi -> `auth.errors.*` i18n kaliti.
 *
 * Ilgari bu xaritalash `handleEmailSubmit` ichida, o'zbekcha matnlar
 * KOMPONENTGA yozib qo'yilgan holda edi — ya'ni en/ru foydalanuvchi ham
 * o'zbekcha xato ko'rardi. Endi hamma xato uchala tilda.
 */
const ERROR_KEY_BY_CODE: Record<string, string> = {
  'auth/user-not-found': 'userNotFound',
  'auth/wrong-password': 'wrongPassword',
  'auth/invalid-credential': 'invalidCredential',
  'auth/invalid-login-credentials': 'invalidCredential',
  'auth/email-already-in-use': 'emailInUse',
  'auth/credential-already-in-use': 'emailInUse',
  'auth/weak-password': 'weakPassword',
  'auth/invalid-email': 'invalidEmail',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'network',
  'auth/reserved-email-domain': 'reservedEmailDomain',
  'auth/provider-already-linked': 'passwordAlreadySet',
  'auth/requires-recent-login': 'requiresRecentLogin',
  'auth/invalid-verification-code': 'otpInvalid',
  'auth/missing-verification-code': 'otpRequired',
  'auth/code-expired': 'otpInvalid',
  'auth/invalid-phone-number': 'phoneInvalid',
  'auth/missing-phone-number': 'phoneInvalid',
}

/**
 * Xatodan i18n kaliti chiqaradi. `overrides` — SHU oqimga xos ma'no:
 * masalan `email-already-in-use` odatda "bu email band" degani, lekin
 * parol biriktirishda "bu raqam boshqa hisobga bog'langan" degani.
 */
const errorKeyOf = (
  e: unknown,
  overrides: Record<string, string> = {},
  fallback = 'generic',
): string => {
  const code = (e as { code?: string })?.code || ''
  return overrides[code] || ERROR_KEY_BY_CODE[code] || fallback
}

/** Telefon + parol bilan kirishda "user-not-found" va "wrong-password" ni
 *  ajratib bo'lmaydi (Firebase email enumeration himoyasi ikkalasini ham
 *  `invalid-credential` qiladi), shuning uchun ikkalasiga bitta,
 *  ikkala holatni ham tushuntiradigan xabar. */
const PHONE_LOGIN_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'phoneNoPassword',
  'auth/wrong-password': 'phoneNoPassword',
  'auth/invalid-credential': 'phoneNoPassword',
  'auth/invalid-login-credentials': 'phoneNoPassword',
}

/** Parol biriktirishda psevdo-email band bo'lsa (hujum yoki eski qoldiq). */
const LINK_PASSWORD_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'phoneNumberTaken',
  'auth/credential-already-in-use': 'phoneNumberTaken',
}

export const AuthPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)

  const phonePasswordOn = isPhonePasswordEnabled()

  const [mode, setMode] = useState<AuthMode>('login')
  // Telefon + parol — asosiy yo'l, shuning uchun ochilishda o'sha tanlangan.
  const [method, setMethod] = useState<AuthMethod>('phone')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input')
  const [otpIntent, setOtpIntent] = useState<OtpIntent>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null)

  /**
   * OTP tasdiqlanishi bilan foydalanuvchi TIZIMGA KIRADI, ya'ni pastdagi
   * "kirgan bo'lsa bosh sahifaga" effekti darhol ishga tushadi va parol
   * yaratish ekranini ko'rsatishga ulgurmaymiz. Shuning uchun parol
   * kutilayotgan paytda ko'chirishni USHLAB turamiz.
   *
   * Bu ataylab `useState` emas: qiymat `confirm()` dan OLDIN, o'sha
   * tikda kerak — state esa keyingi render'da yangilanadi va kech qoladi.
   */
  const holdRedirectRef = useRef(false)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (user && !holdRedirectRef.current) navigate('/')
  }, [user, navigate])

  // reCAPTCHA widget'i sahifadan chiqilganda tozalanadi, aks holda
  // qayta kirishda "already rendered in this element" xatosi chiqadi.
  useEffect(() => () => {
    recaptchaVerifierRef.current?.clear()
    recaptchaVerifierRef.current = null
  }, [])

  const showError = useCallback(
    (key: string) => setError(t(`auth.errors.${key}`, { min: MIN_PASSWORD_LENGTH })),
    [t],
  )

  /** Har yuborishda YANGI verifier: eskisi ishlatilgan bo'lsa qayta
   *  yuborish ishlamaydi, ikkitasi bir vaqtda bo'lsa widget takrorlanadi. */
  const freshRecaptcha = (): RecaptchaVerifier => {
    recaptchaVerifierRef.current?.clear()
    recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container')
    return recaptchaVerifierRef.current
  }

  const resetFlow = (next: Partial<{ mode: AuthMode; method: AuthMethod }> = {}) => {
    if (next.mode) setMode(next.mode)
    if (next.method) setMethod(next.method)
    setError('')
    setOtp('')
    setPhoneStep('input')
    setConfirmResult(null)
    holdRedirectRef.current = false
  }

  // ---------------------------------------------------------------- Google

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (e) {
      showError(errorKeyOf(e, {}, 'googleFailed'))
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------- Email+parol

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { showError('emailRequired'); return }
    // Telefon oqimi ishlatadigan psevdo-domenni bu yerda BLOKLAYMIZ:
    // aks holda hujumchi birovning raqamidan yasalgan manzilni oldindan
    // band qilib, egasiga parol qo'yish imkonini bermay qo'yardi.
    if (mode === 'register' && isReservedAuthEmail(email)) {
      showError('reservedEmailDomain'); return
    }
    if (!password) { showError('passwordRequired'); return }
    // Uzunlik faqat RO'YXATDAN O'TISHDA tekshiriladi: eski mijozlarning
    // paroli 6 ta belgi bo'lishi mumkin, ular kira olishi kerak.
    if (mode === 'register' && password.length < MIN_PASSWORD_LENGTH) {
      showError('passwordMin'); return
    }
    if (mode === 'register' && password !== confirmPassword) {
      showError('passwordMatch'); return
    }
    setLoading(true)
    try {
      if (mode === 'login') await signInWithEmail(email, password)
      else await registerWithEmail(email, password, name)
      navigate('/')
    } catch (err) {
      showError(errorKeyOf(err))
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------- Telefon + parol

  /** Kirish: SMS YUBORILMAYDI — psevdo-email orqali oddiy parol tekshiruvi. */
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const normalized = normalizePhone(phone)
    if (!normalized) { showError('phoneRequired'); return }
    if (!isValidPhone(normalized)) { showError('phoneInvalid'); return }
    if (!password) { showError('passwordRequired'); return }
    // Bu yerga odatda tushilmaydi (telefon+parol o'chiq bo'lsa bu forma
    // umuman chizilmaydi), lekin sabab ko'rsatilmay qolmasin.
    if (!phonePasswordOn) { setError(t('auth.phonePasswordDisabled')); return }

    setLoading(true)
    try {
      await signInWithPhonePassword(normalized, password)
      navigate('/')
    } catch (err) {
      showError(errorKeyOf(err, PHONE_LOGIN_ERRORS))
    } finally {
      setLoading(false)
    }
  }

  /** SMS yuborish — uchala oqim uchun bitta joy. */
  const startOtp = async (intent: OtpIntent) => {
    setError('')
    const normalized = normalizePhone(phone)
    if (!normalized) { showError('phoneRequired'); return }
    if (!isValidPhone(normalized)) { showError('phoneInvalid'); return }

    setLoading(true)
    try {
      const result = await sendPhoneOTP(normalized, freshRecaptcha())
      setConfirmResult(result)
      setOtpIntent(intent)
      setOtp('')
      setPhoneStep('otp')
    } catch (err) {
      showError(errorKeyOf(err, {}, 'otpSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!confirmResult) return
    if (otp.length < 6) { showError('otpRequired'); return }
    setError('')

    // Parol ekrani kerakmi? Kerak bo'lsa avtomatik ko'chirishni ushlab
    // turamiz — `confirm()` dan OLDIN, chunki u kirish holatini darhol
    // o'zgartiradi.
    const needsPassword = phonePasswordOn && otpIntent !== 'signin'
    holdRedirectRef.current = needsPassword

    setLoading(true)
    try {
      await confirmResult.confirm(otp)
      if (needsPassword) {
        setPassword('')
        setConfirmPassword('')
        setPhoneStep('password')
      } else {
        navigate('/')
      }
    } catch (err) {
      holdRedirectRef.current = false
      showError(errorKeyOf(err, {}, 'otpInvalid'))
    } finally {
      setLoading(false)
    }
  }

  /** Ro'yxatdan o'tish va parolni tiklash — ikkalasi ham shu yerda tugaydi. */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password) { showError('passwordRequired'); return }
    if (password.length < MIN_PASSWORD_LENGTH) { showError('passwordMin'); return }
    if (password !== confirmPassword) { showError('passwordMatch'); return }

    const currentUser = auth.currentUser
    if (!currentUser) {
      // Sessiya yo'qolgan (masalan tab uzoq turib qolgan) — raqamdan boshlaymiz.
      holdRedirectRef.current = false
      setPhoneStep('input')
      showError('requiresRecentLogin')
      return
    }

    setLoading(true)
    try {
      await attachPasswordToPhoneUser(currentUser, password)
      if (otpIntent === 'register' && name && !currentUser.displayName) {
        await updateDisplayName(currentUser, name)
        // `updateProfile` `onAuthStateChanged` ni ISHGA TUSHIRMAYDI, ya'ni
        // Redux eski (ismsiz) holatda qolardi va Navbar'da ism o'rniga
        // telefon raqami ko'rinardi. Shuning uchun qo'lda yangilaymiz.
        // `isAdmin` allaqachon hisoblangan — uni qayta so'ramaymiz.
        dispatch(setUser(toAuthUser(currentUser, user?.isAdmin ?? false)))
      }
      holdRedirectRef.current = false
      navigate('/')
    } catch (err) {
      showError(errorKeyOf(err, LINK_PASSWORD_ERRORS))
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------ UI

  const inputClass = 'w-full h-12 inpHover'
  const labelClass = 'block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1'
  const primaryButtonClass =
    'w-full h-12 bg-[#274C5B] dark:bg-[#7EB693] text-white rounded-xl font-bold ' +
    'hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2'
  const linkButtonClass = 'text-sm text-[#7EB693] font-semibold hover:underline'

  const passwordTitleKey = otpIntent === 'reset' ? 'auth.newPasswordTitle' : 'auth.createPasswordTitle'
  const passwordSubtitleKey =
    otpIntent === 'reset' ? 'auth.newPasswordSubtitle' : 'auth.createPasswordSubtitle'

  const headingKey =
    method === 'phone' && phoneStep === 'password'
      ? passwordTitleKey
      : mode === 'login' ? 'auth.loginTitle' : 'auth.registerTitle'
  const subheadingKey =
    method === 'phone' && phoneStep === 'password'
      ? passwordSubtitleKey
      : mode === 'login' ? 'auth.loginSubtitle' : 'auth.registerSubtitle'

  // Parol ekranida tab'lar va Google tugmasi ortiqcha — oqim tugashi kerak.
  const showMethodChooser = !(method === 'phone' && phoneStep === 'password')

  return (
    <div className="min-h-screen bg-[#F1F8F4] dark:bg-[#0f172a] flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Organick" className="h-12" width={155} height={223} decoding="async" fetchPriority="high" />
            <span className="text-2xl font-bold text-[#274C5B] dark:text-white">Organick</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
          {/* Login/Register Tabs */}
          {showMethodChooser && (
            <div className="flex">
              <button
                onClick={() => resetFlow({ mode: 'login' })}
                className={`flex-1 py-4 font-bold text-sm transition-colors ${mode === 'login' ? 'bg-[#274C5B] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => resetFlow({ mode: 'register' })}
                className={`flex-1 py-4 font-bold text-sm transition-colors ${mode === 'register' ? 'bg-[#274C5B] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          <div className="p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-1">{t(headingKey)}</h2>
            <p className="text-gray-400 text-sm mb-6">{t(subheadingKey)}</p>

            {showMethodChooser && (
              <>
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl py-3 font-semibold text-[#274C5B] dark:text-white hover:border-[#7EB693] transition-colors mb-4 disabled:opacity-50"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="min-w-0 truncate">{t('auth.googleLogin')}</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                  <span className="text-gray-400 text-sm">{t('auth.or')}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                </div>

                {/* Method Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['phone', 'email'] as AuthMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => resetFlow({ method: m })}
                      className={`flex-1 min-w-0 py-2 px-2 rounded-lg text-sm font-semibold transition-colors
                        ${method === m ? 'bg-[#7EB693] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {m === 'email'
                        ? t('auth.emailLogin')
                        : phonePasswordOn ? t('auth.phonePasswordTab') : t('auth.phoneLogin')}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm break-words">{error}</p>
              </div>
            )}

            {/* Email Form */}
            {method === 'email' && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                {mode === 'register' && (
                  <div>
                    <label className={labelClass}>{t('auth.name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('auth.namePlaceholder')}
                      className={inputClass}
                    />
                  </div>
                )}
                <div>
                  <label className={labelClass}>{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={inputClass}
                  />
                  {mode === 'register' && (
                    <p className="text-xs text-gray-400 mt-1">{t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}</p>
                  )}
                </div>
                {mode === 'register' && (
                  <div>
                    <label className={labelClass}>{t('auth.confirmPassword')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      autoComplete="new-password"
                      className={inputClass}
                    />
                  </div>
                )}
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading && <i className="fas fa-spinner fa-spin"></i>}
                  {mode === 'login' ? t('auth.login') : t('auth.register')}
                </button>
              </form>
            )}

            {/* ============================ Telefon oqimi ============================ */}
            {method === 'phone' && phoneStep === 'input' && (
              <div className="flex flex-col gap-4">
                {!phonePasswordOn && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    {t('auth.phonePasswordDisabled')}
                  </p>
                )}

                {mode === 'register' && (
                  <div>
                    <label className={labelClass}>{t('auth.name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('auth.namePlaceholder')}
                      className={inputClass}
                    />
                  </div>
                )}

                {/* Kirish: telefon + parol, SMS yuborilmaydi */}
                {mode === 'login' && phonePasswordOn ? (
                  <form onSubmit={handlePhonePasswordLogin} className="flex flex-col gap-4">
                    <div>
                      <label className={labelClass}>{t('auth.phone')}</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder={t('auth.phonePlaceholder')}
                        autoComplete="tel"
                        className={inputClass}
                      />
                      <p className="text-xs text-gray-400 mt-1">{t('auth.phoneHint')}</p>
                    </div>
                    <div>
                      <label className={labelClass}>{t('auth.password')}</label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={t('auth.passwordPlaceholder')}
                        autoComplete="current-password"
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" disabled={loading} className={primaryButtonClass}>
                      {loading && <i className="fas fa-spinner fa-spin"></i>}
                      {t('auth.login')}
                    </button>

                    {/* SMS — parolni unutganlar va parol o'rnatmaganlar uchun zaxira yo'l */}
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-2">
                      <button type="button" onClick={() => startOtp('signin')} disabled={loading} className={linkButtonClass}>
                        {t('auth.loginWithSms')}
                      </button>
                      <button type="button" onClick={() => startOtp('reset')} disabled={loading} className={linkButtonClass}>
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Ro'yxatdan o'tish (yoki telefon+parol o'chirilgan holat): SMS bilan boshlanadi */
                  <>
                    <div>
                      <label className={labelClass}>{t('auth.phone')}</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder={t('auth.phonePlaceholder')}
                        autoComplete="tel"
                        className={inputClass}
                      />
                      <p className="text-xs text-gray-400 mt-1">{t('auth.phoneHint')}</p>
                    </div>
                    {mode === 'register' && phonePasswordOn && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 bg-[#F1F8F4] dark:bg-gray-800 rounded-lg p-3">
                        {t('auth.smsOnceNote')}
                      </p>
                    )}
                    <button
                      onClick={() => startOtp(mode === 'register' ? 'register' : 'signin')}
                      disabled={loading}
                      className={primaryButtonClass}
                    >
                      {loading && <i className="fas fa-spinner fa-spin"></i>}
                      {t('auth.sendCode')}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* OTP — uchala oqim uchun bir xil ekran */}
            {method === 'phone' && phoneStep === 'otp' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>{t('auth.verificationCode')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className={`${inputClass} text-center text-2xl font-bold tracking-widest`}
                  />
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {t('auth.otpSentTo', { phone: normalizePhone(phone) })}
                  </p>
                </div>
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className={primaryButtonClass}>
                  {loading && <i className="fas fa-spinner fa-spin"></i>}
                  {t('auth.verify')}
                </button>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('input'); setOtp(''); setError('') }}
                    disabled={loading}
                    className={linkButtonClass}
                  >
                    ← {t('auth.changeNumber')}
                  </button>
                  <button type="button" onClick={() => startOtp(otpIntent)} disabled={loading} className={linkButtonClass}>
                    {t('auth.resendCode')}
                  </button>
                </div>
              </div>
            )}

            {/* Parol yaratish (ro'yxatdan o'tish) / almashtirish (tiklash) */}
            {method === 'phone' && phoneStep === 'password' && (
              <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}</p>
                </div>
                <div>
                  <label className={labelClass}>{t('auth.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading && <i className="fas fa-spinner fa-spin"></i>}
                  {t('auth.savePassword')}
                </button>
              </form>
            )}

            {showMethodChooser && (
              <p className="text-center text-sm text-gray-400 mt-6">
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <button
                  onClick={() => resetFlow({ mode: mode === 'login' ? 'register' : 'login' })}
                  className="text-[#7EB693] font-bold hover:underline"
                >
                  {mode === 'login' ? t('auth.register') : t('auth.login')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
