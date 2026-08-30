import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.webp'
import footer from '../assets/footer.webp'

export const FooterTop = () => {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')

  const postingMessage = () => {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
    const groupToken = import.meta.env.VITE_TELEGRAM_GROUP_ID || ''
    const threadId = import.meta.env.VITE_TELEGRAM_THREAD_ID || ''
    if (!botToken || !groupToken || !message.trim()) return
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        chat_id: groupToken,
        message_thread_id: threadId ? Number(threadId) : undefined,
        text: `📧 Newsletter subscription:\n${message}`,
      }),
    })
    setMessage('')
    alert(t('footer.subscribe') + '!')
  }

  return (
    <footer className="footer-top w-full py-16 flex items-center justify-center bg-[#F1F8F4] dark:bg-[#1e293b]">
      <div
        style={{ backgroundImage: `url(${footer})` }}
        className="formback rounded-2xl w-[95%] max-w-4xl h-auto py-12 flex items-center justify-center bg-cover bg-center"
      >
        <div className="w-[85%] flex flex-col sm:flex-row justify-between items-center gap-6 text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center sm:text-left">{t('footer.newsletter')}</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              value={message}
              onInput={e => setMessage((e.target as HTMLInputElement).value)}
              className="flex-1 sm:w-56 h-14 bg-white text-gray-500 outline-0 border-0 rounded-xl pl-3 text-sm"
            />
            <button
              type="button"
              onClick={postingMessage}
              className="h-14 px-5 bg-[#274C5B] rounded-xl text-white font-bold whitespace-nowrap hover:bg-[#1d3a47] transition-colors text-sm"
            >
              {t('footer.subscribe')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export const FooterBottom = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <footer className="w-full bg-white dark:bg-[#0f172a] pt-10 pb-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-[#274C5B] dark:text-gray-300 pb-8 border-b border-gray-200 dark:border-gray-700">
        {/* Contact */}
        <div className="flex flex-col items-start sm:items-end gap-2 sm:border-r border-gray-200 dark:border-gray-700 sm:pr-8">
          <h1 className="text-2xl font-bold text-[#274C5B] dark:text-white">{t('footer.contactUs')}</h1>
          <h3 className="font-bold text-sm">{t('footer.email')}</h3>
          <p className="text-sm">abdullohdevlc@gmail.com</p>
          <h3 className="font-bold text-sm">{t('footer.phone')}</h3>
          <p className="text-sm">+998 90 854 56 03</p>
          <h3 className="font-bold text-sm">{t('footer.address')}</h3>
          <p className="text-sm">88 road, Brooklyn street, USA</p>
        </div>

        {/* Logo + Social */}
        <div className="flex flex-col gap-4 justify-center items-center sm:border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="" className="w-8 h-10" width={32} height={40} decoding="async" loading="lazy" />
            <h1 className="text-2xl font-bold text-[#274C5B] dark:text-white">Organick</h1>
          </div>
          <p className="text-center text-sm text-gray-500">{t('footer.description')}</p>
          <ul className="flex gap-2">
            {[
              { href: 'https://www.instagram.com/organick/', icon: 'fa-instagram' },
              { href: 'https://www.instagram.com/Abdulloh.o7l', icon: 'fa-facebook' },
              { href: 'https://www.instagram.com/Abdulloh.o7l', icon: 'fa-twitter' },
              { href: 'https://t.me/organick_org', icon: 'fa-telegram' },
            ].map((s, i) => (
              <li key={i} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
                <a href={s.href} target="_blank" rel="noreferrer" className="iconHover Ajustify-center relative w-full h-full rounded-full">
                  <i className={`fa-brands ${s.icon}`}></i>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <div className="sm:pl-8">
          <h1 className="font-bold text-2xl text-[#274C5B] dark:text-white mb-4">{t('footer.utilityPages')}</h1>
          <ul className="flex flex-col gap-3 text-sm">
            <li><button onClick={() => navigate('/')} className="hover:text-[#7EB693] transition-colors">{t('footer.styleGuide')}</button></li>
            <li><button onClick={() => navigate('/notfound')} className="hover:text-[#7EB693] transition-colors">{t('footer.notFound')}</button></li>
            <li><button onClick={() => navigate('/')} className="hover:text-[#7EB693] transition-colors">{t('footer.password')}</button></li>
            <li><button onClick={() => navigate('/')} className="hover:text-[#7EB693] transition-colors">{t('footer.licences')}</button></li>
            <li><button onClick={() => navigate('/')} className="hover:text-[#7EB693] transition-colors">{t('footer.changelog')}</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 text-center text-sm text-gray-400">
        <p>{t('footer.copyright')} - Powered by{' '}
          <a target="_blank" href="https://t.me/Abdulloh_77700" rel="noreferrer" className="text-[#7EB693] hover:underline">
            Abdulloh
          </a>
        </p>
      </div>
    </footer>
  )
}
