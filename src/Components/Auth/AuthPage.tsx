import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../hooks'
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  setupRecaptcha,
  sendPhoneOTP,
} from '../../firebase/auth'
import { ConfirmationResult } from 'firebase/auth'
import logo from '../../assets/logo.webp'

type AuthMode = 'login' | 'register'
type AuthMethod = 'google' | 'email' | 'phone'

export const AuthPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)

  const [mode, setMode] = useState<AuthMode>('login')
  const [method, setMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (e: any) {
      setError(e.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError(t('auth.errors.emailRequired')); return }
    if (!password) { setError(t('auth.errors.passwordRequired')); return }
    if (password.length < 6) { setError(t('auth.errors.passwordMin')); return }
    if (mode === 'register' && password !== confirmPassword) {
      setError(t('auth.errors.passwordMatch')); return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await registerWithEmail(email, password, name)
      }
      navigate('/')
    } catch (e: any) {
      const code = e.code || ''
      const msg =
        code === 'auth/user-not-found'       ? "Bu email bilan hisob topilmadi. Avval ro'yxatdan o'ting." :
        code === 'auth/wrong-password'        ? "Parol noto'g'ri. Qaytadan urinib ko'ring." :
        code === 'auth/invalid-credential'    ? "Email yoki parol noto'g'ri. Avval «Ro'yxatdan o'tish» tab ni bosing." :
        code === 'auth/email-already-in-use'  ? "Bu email allaqachon ro'yxatdan o'tgan. Kirish sahifasini ishlating." :
        code === 'auth/weak-password'         ? "Parol juda zaif. Kamida 6 ta belgi kiriting." :
        code === 'auth/invalid-email'         ? "Email manzil noto'g'ri formatda." :
        code === 'auth/too-many-requests'     ? "Juda ko'p urinish. Bir oz kuting." :
        e.message || 'Xatolik yuz berdi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phone) { setError(t('auth.errors.phoneRequired')); return }
    setLoading(true)
    setError('')
    try {
      const verifier = setupRecaptcha('recaptcha-container')
      const result = await sendPhoneOTP(phone, verifier)
      setConfirmResult(result)
      setStep('otp')
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!confirmResult) return
    setLoading(true)
    setError('')
    try {
      await confirmResult.confirm(otp)
      navigate('/')
    } catch (e: any) {
      setError('Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F8F4] dark:bg-[#0f172a] flex items-center justify-center p-4">
      <div id="recaptcha-container" ref={recaptchaRef}></div>

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
          <div className="flex">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-4 font-bold text-sm transition-colors ${mode === 'login' ? 'bg-[#274C5B] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-4 font-bold text-sm transition-colors ${mode === 'register' ? 'bg-[#274C5B] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
            >
              {t('auth.register')}
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-1">
              {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl py-3 font-semibold text-[#274C5B] dark:text-white hover:border-[#7EB693] transition-colors mb-4 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {t('auth.googleLogin')}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
              <span className="text-gray-400 text-sm">{t('auth.or')}</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            </div>

            {/* Method Tabs */}
            <div className="flex gap-2 mb-6">
              {(['email', 'phone'] as AuthMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setError(''); setStep('input') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${method === m ? 'bg-[#7EB693] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}
                >
                  {m === 'email' ? t('auth.emailLogin') : t('auth.phoneLogin')}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Form */}
            {method === 'email' && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('auth.namePlaceholder')}
                      className="w-full h-12 inpHover"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full h-12 inpHover"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full h-12 inpHover"
                  />
                </div>
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.confirmPassword')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full h-12 inpHover"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#274C5B] dark:bg-[#7EB693] text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <i className="fas fa-spinner fa-spin"></i>}
                  {mode === 'login' ? t('auth.login') : t('auth.register')}
                </button>
              </form>
            )}

            {/* Phone Form */}
            {method === 'phone' && (
              <div className="flex flex-col gap-4">
                {step === 'input' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.phone')}</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder={t('auth.phonePlaceholder')}
                        className="w-full h-12 inpHover"
                      />
                    </div>
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full h-12 bg-[#274C5B] dark:bg-[#7EB693] text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading && <i className="fas fa-spinner fa-spin"></i>}
                      {t('auth.sendCode')}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#274C5B] dark:text-gray-300 mb-1">{t('auth.verificationCode')}</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full h-12 inpHover text-center text-2xl font-bold tracking-widest"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length < 6}
                      className="w-full h-12 bg-[#274C5B] dark:bg-[#7EB693] text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading && <i className="fas fa-spinner fa-spin"></i>}
                      {t('auth.verify')}
                    </button>
                    <button onClick={() => setStep('input')} className="text-sm text-[#7EB693] hover:underline text-center">
                      ← {t('auth.sendCode')}
                    </button>
                  </>
                )}
              </div>
            )}

            <p className="text-center text-sm text-gray-400 mt-6">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className="text-[#7EB693] font-bold hover:underline"
              >
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
