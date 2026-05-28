import { useTranslation } from 'react-i18next'

export const ContactForm = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full max-w-3xl px-4 py-8 space-y-6 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white px-4">{t('contact.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6 px-4">
        <div>
          <label htmlFor="fullName" className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.fullName')}
          </label>
          <input type="text" id="fullName" placeholder={t('contact.form.namePlaceholder')} className="inpHover w-full h-12" />
        </div>
        <div>
          <label htmlFor="email" className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.email')}
          </label>
          <input type="email" id="email" placeholder={t('contact.form.emailPlaceholder')} className="inpHover w-full h-12" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 px-4">
        <div>
          <label htmlFor="company" className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.company')}
          </label>
          <input type="text" id="company" placeholder={t('contact.form.companyPlaceholder')} className="inpHover w-full h-12" />
        </div>
        <div>
          <label htmlFor="subject" className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
            {t('contact.form.subject')}
          </label>
          <input type="text" id="subject" placeholder={t('contact.form.subjectPlaceholder')} className="inpHover w-full h-12" />
        </div>
      </div>
      <div className="px-4">
        <label htmlFor="message" className="block py-2 text-sm font-semibold text-[#274C5B] dark:text-gray-300">
          {t('contact.form.message')}
        </label>
        <textarea id="message" rows={5} placeholder={t('contact.form.messagePlaceholder')} className="inpHover w-full"></textarea>
      </div>
      <div className="pt-2 px-4">
        <button type="button" className="w-[180px] h-[55px] rounded-2xl bg-[#274C5B] text-white font-bold hover:bg-[#1d3a47] transition-colors">
          {t('contact.form.sendBtn')}
        </button>
      </div>
    </div>
  )
}
