import { useTranslation } from 'react-i18next'
import { FooterBottom, FooterTop } from './Footer'
import { Navbar } from './Navbar'
import ContactHeader from '../assets/contact/ContactHeader.webp'
import Contact2 from '../assets/contact/Contact2.webp'
import card1 from '../assets/contact/card1.webp'
import card2 from '../assets/contact/card2.webp'
import Contact3 from '../assets/contact/Contact3.webp'
import { ContactForm } from './ContactForm'

export const Contact = () => {
  const { t } = useTranslation()

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${ContactHeader})` }} className="w-full h-[50vh] bg-cover Ajustify-center">
        <h1 className="font-bold text-[#274C5B] text-4xl md:text-5xl">{t('contact.title')}</h1>
      </header>

      <section className="w-full px-4 py-16">
        {/* Section 1 */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 mb-20">
          <div className="w-full md:w-1/2">
            <img
              src={Contact2}
              alt="Contact"
              className="object-cover w-full h-full rounded-2xl"
              width={623}
              height={640}
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="w-full md:w-1/2 text-[#274C5B] dark:text-white">
            <h1 className="font-bold text-2xl md:text-3xl mb-4">{t('contact.subtitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('contact.desc')}</p>
            <div className="flex flex-col gap-3 mb-6">
              <figure className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-2xl p-3 flex gap-3">
                <div className="w-12 h-12 bg-[#F9F8F9] dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <img src={card1} alt="" className="w-6 h-6" width={24} height={24} decoding="async" loading="lazy" />
                </div>
                <figcaption>
                  <h2 className="font-bold text-sm">{t('contact.message')}</h2>
                  <p className="text-gray-400 text-sm">support@organic.com</p>
                </figcaption>
              </figure>
              <figure className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-2xl p-3 flex gap-3">
                <div className="w-12 h-12 bg-[#F9F8F9] dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <img src={card2} alt="" className="w-6 h-6" width={24} height={24} decoding="async" loading="lazy" />
                </div>
                <figcaption>
                  <h2 className="font-bold text-sm">{t('contact.phone')}</h2>
                  <p className="text-gray-400 text-sm">+01 123 456 789</p>
                </figcaption>
              </figure>
            </div>
            <ul className="flex gap-2">
              {[
                { href: 'https://www.instagram.com/organick/', icon: 'fa-instagram' },
                { href: 'https://www.instagram.com/Abdulloh.o7l', icon: 'fa-facebook' },
                { href: 'https://www.instagram.com/Abdulloh.o7l', icon: 'fa-twitter' },
                { href: 'https://t.me/organick_org', icon: 'fa-telegram' },
              ].map((s, i) => (
                <li key={i} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
                  <a href={s.href} target="_blank" rel="noreferrer" className="iconHover Ajustify-center relative w-full h-full rounded-full">
                    <i className={`fa-brands ${s.icon}`}></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Location */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="w-full h-auto md:h-[500px] bg-cover bg-center rounded-2xl flex justify-end items-center p-4 md:p-10"
               style={{ backgroundImage: `url(${Contact3})` }}>
            <div className="w-full max-w-sm bg-white dark:bg-[#1e293b] text-[#274C5B] dark:text-white rounded-2xl p-8">
              <h3 className="text-[#7EB693] font-[YellowTail] text-3xl">{t('contact.location.title')}</h3>
              <h1 className="font-bold text-3xl mb-3">{t('contact.location.subtitle')}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('contact.location.desc')}</p>
              {[
                { city: t('contact.location.ny'), addr: t('contact.location.nyAddr') },
                { city: t('contact.location.london'), addr: t('contact.location.londonAddr') },
              ].map((loc, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="text-[#7EB693] text-2xl flex-shrink-0 mt-1">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{loc.city}</h3>
                    <p className="text-gray-400 text-sm">{loc.addr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-5xl mx-auto flex justify-center">
          <ContactForm />
        </div>
      </section>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
