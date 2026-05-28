import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppSelector } from '../hooks'
import aboutUsBack from '../assets/about/aboutUsBack.png'
import aboutUsFront from '../assets/about/aboutUsFront.png'
import aboutUs2Left from '../assets/about/aboutUs2Left.png'
import traktor from '../assets/about/traktor.svg'
import traktorRight from '../assets/about/traktorRight.svg'
import aboutUs3Right from '../assets/about/aboutUs3Right.png'

export const About = () => {
  const { t } = useTranslation()
  const teams = useAppSelector(s => s.data.teams)
  const products = useAppSelector(s => s.data.products)

  const benefits = [
    { icon: 'fa-solid fa-cart-shopping', key: 'returnPolicy', descKey: 'returnDesc' },
    { icon: 'fa-solid fa-leaf', key: 'fresh', descKey: 'freshDesc' },
    { icon: 'fa-solid fa-clock', key: 'support', descKey: 'supportDesc' },
    { icon: 'fa-solid fa-credit-card', key: 'secured', descKey: 'securedDesc' },
  ]

  return (
    <>
      <Navbar />

      {/* Header */}
      <header style={{ backgroundImage: `url(${aboutUsBack})` }} className="w-full h-[50vh] bg-cover">
        <div style={{ backgroundImage: `url(${aboutUsFront})` }} className="w-full h-full bg-cover Ajustify-center">
          <h1 className="text-[#274C5B] font-bold text-4xl md:text-5xl">{t('about.title')}</h1>
        </div>
      </header>

      {/* About Main */}
      <main className="w-full flex flex-col md:flex-row py-16 px-4 lg:px-20 gap-10">
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={aboutUs2Left} alt="About Us" className="max-w-full" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="font-[YellowTail] text-[#7EB693] text-2xl">{t('about.title')}</h3>
          <h1 className="text-[#274C5B] dark:text-white font-bold text-3xl md:text-4xl">{t('about.subtitle')}</h1>
          <p className="text-[#274C5B] dark:text-gray-300">{t('about.description')}</p>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center p-2">
                <img src={traktor} alt="" className="w-full h-full" />
              </div>
              <h3 className="text-[#274C5B] dark:text-white font-bold">{t('about.equipment')}</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center p-2">
                <img src={traktorRight} alt="" className="w-full h-full" />
              </div>
              <h3 className="text-[#274C5B] dark:text-white font-bold">{t('about.noHormones')}</h3>
            </div>
          </div>
          <button className="w-[170px] h-[55px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 font-bold hover:bg-[#1d3a47] transition-colors mt-2">
            {t('about.exploreBtn')}
            <i className="fas fa-arrow-right bg-[#335b6b] rounded-full text-xs p-1"></i>
          </button>
        </div>
      </main>

      {/* Why Us */}
      <article className="w-full bg-[#F1F1F1] dark:bg-[#1e293b] py-16 px-4 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 mb-12">
            <div className="w-full md:w-1/2">
              <h3 className="font-[YellowTail] text-[#7EB693] text-3xl">{t('about.whyUs.title')}</h3>
              <h1 className="text-[#274C5B] dark:text-white font-bold text-3xl md:text-4xl py-4">{t('about.whyUs.subtitle')}</h1>
              <p className="text-[#274C5B] dark:text-gray-300">{t('about.whyUs.desc')}</p>
            </div>
            <div className="w-full md:w-1/2">
              <img src={aboutUs3Right} alt="" className="rounded-3xl w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((card, i) => (
              <div key={i} className="bg-white dark:bg-[#0f172a] text-[#274C5B] dark:text-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm">
                <div className="w-16 h-16 flex items-center justify-center text-2xl bg-[#F9F8F8] dark:bg-[#1e293b] rounded-2xl">
                  <i className={card.icon}></i>
                </div>
                <h2 className="font-bold text-center">{t(`about.whyUs.${card.key}`)}</h2>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t(`about.whyUs.${card.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Team */}
      <div className="w-full py-16 px-4 flex flex-col items-center">
        <h1 className="font-[YellowTail] text-[#7EB693] text-3xl">{t('about.team.subtitle')}</h1>
        <h1 className="text-[#274C5B] dark:text-white text-3xl md:text-5xl font-bold my-3">{t('about.team.title')}</h1>
        <p className="max-w-2xl text-center text-[#274C5B] dark:text-gray-300 mb-8">{t('about.team.desc')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {teams.slice(0, 3).map((team, i) => (
            <figure key={i} className="overflow-hidden bg-[#F9F9F9] dark:bg-[#1e293b] rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
              <img src={team.team} alt={team.name} className="w-full" />
              <figcaption className="p-4">
                <h2 className="text-[#274C5B] dark:text-white font-bold">{team.name}</h2>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-[YellowTail] text-[#7EB693]">{team.job}</h3>
                  <div className="flex gap-2 text-[#274C5B] dark:text-gray-300">
                    {team.isInstagram && <i className="fa-brands fa-instagram cursor-pointer hover:text-[#7EB693]"></i>}
                    {team.isFacebook && <i className="fa-brands fa-facebook cursor-pointer hover:text-[#7EB693]"></i>}
                    {team.isTwitter && <i className="fa-brands fa-twitter cursor-pointer hover:text-[#7EB693]"></i>}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Offer */}
      <article className="w-full py-16 px-4 flex flex-col items-center text-white bg-[#274C5B]">
        <h3 className="font-[YellowTail] text-3xl text-[#7EB693]">{t('about.offer.subtitle')}</h3>
        <h1 className="text-4xl font-bold pb-10">{t('about.offer.title')}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl w-full">
          {products.slice(16, 20).map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="bg-white rounded-2xl p-4 w-full flex items-center justify-center h-32">
                <img src={p.img} alt={p.name} className="max-h-full object-contain" />
              </div>
              <span className="text-sm font-semibold">{p.category}</span>
            </div>
          ))}
        </div>
      </article>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
