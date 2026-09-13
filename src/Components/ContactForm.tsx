import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendTelegram } from '../utils/telegram'
import { isValidEmail } from '../utils/validate'

export const ContactForm = () => {
  const { t } = useTranslation()
  const [form, setForm] = useState({ fullName: '', email: '', company: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const handleSend = async () => {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = t('contact.form.errors.nameRequired')
    if (!form.email.trim()) errs.email = t('contact.form.errors.emailRequired')
    else if (!isValidEmail(form.email)) errs.email = t('contact.form.errors.emailInvalid')
    if (!form.message.trim()) errs.message = t('contact.form.errors.messageRequired')
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    setStatus('loading')
    const text = [
      '📩 <b>YANGI MUROJAAT</b>',
      '',
      `👤 Ism: ${form.fullName}`,
      `📧 Email: ${form.email}`,
      form.company ? `🏢 Kompaniya: ${form.company}` : '',
      form.subject ? `📌 Mavzu: ${form.subject}` : '',
      '',
      `💬 Xabar:\n${form.message}`,
    ].filter(Boolean).join('\n')
    const ok = await sendTelegram(text, 'contact')
    setStatus(ok ? 'ok' : 'err')
    if (ok) setForm({ fullName: '', email: '', company: '', subject: '', message: '' })
    setTimeout(() => setStatus('idle'), ok ? 4000 : 3000)
  }

  return (
    <div className="w-full max-w-3xl px-4 py-8 space-y-6 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white px-4">{t('contact.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6 px-4">
        <div>
          <label className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.fullName')}
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            placeholder={t('contact.form.namePlaceholder')}
            className={`inpHover w-full h-12 ${errors.fullName ? 'border-red-400 focus:border-red-400' : ''}`}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.email')}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder={t('contact.form.emailPlaceholder')}
            className={`inpHover w-full h-12 ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 px-4">
        <div>
          <label className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.company')}
          </label>
          <input
            type="text"
            value={form.company}
            onChange={e => set('company', e.target.value)}
            placeholder={t('contact.form.companyPlaceholder')}
            className="inpHover w-full h-12"
          />
        </div>
        <div>
          <label className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.subject')}
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={e => set('subject', e.target.value)}
            placeholder={t('contact.form.subjectPlaceholder')}
            className="inpHover w-full h-12"
          />
        </div>
      </div>
      <div className="px-4">
        <label className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
          {t('contact.form.message')}
        </label>
        <textarea
          rows={5}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder={t('contact.form.messagePlaceholder')}
          className={`inpHover w-full ${errors.message ? 'border-red-400 focus:border-red-400' : ''}`}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>
      <div className="pt-2 px-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSend}
          disabled={status === 'loading'}
          className="w-[180px] h-[55px] rounded-2xl bg-[#274C5B] text-white font-bold hover:bg-[#1d3a47] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <><i className="fas fa-spinner fa-spin"></i> Yuborilmoqda...</>
          ) : (
            t('contact.form.sendBtn')
          )}
        </button>
        {status === 'ok' && (
          <span className="text-green-600 font-semibold flex items-center gap-1">
            <i className="fas fa-check-circle"></i> {t('contact.form.success')}
          </span>
        )}
        {status === 'err' && (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            <i className="fas fa-times-circle"></i> {t('contact.form.error')}
          </span>
        )}
      </div>
    </div>
  )
}
