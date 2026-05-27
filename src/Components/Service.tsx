import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom } from './Footer'
import ServiceHeaderBack from '../assets/Service/ServiceHeaderBack.png'
import ServiceHeaderFront from '../assets/Service/ServiceHeaderFront.png'
import Service3 from '../assets/Service/Service3.png'

export const Service = () => {
  const { t } = useTranslation()

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${ServiceHeaderBack})` }} className="w-full h-[50vh] bg-cover">
        <div style={{ backgroundImage: `url(${ServiceHeaderFront})` }} className="w-full h-full bg-cover Ajustify-center">
          <h1 className="font-bold text-[#274C5B] text-4xl md:text-5xl">{t('service.title')}</h1>
        </div>
      </header>

      <article className="w-full py-16 px-4 text-center">
        <h3 className="font-[YellowTail] text-[#7EB693] text-2xl mb-2">{t('service.whatWeGrow')}</h3>
        <h1 className="font-bold text-[#274C5B] dark:text-white text-4xl md:text-5xl">{t('service.subtitle')}</h1>
      </article>

      <article className="w-full h-screen bg-cover flex items-center justify-center" style={{ backgroundImage: `url(${Service3})` }}>
        <div className="flex flex-col items-center text-center px-4">
          <h3 className="font-[YellowTail] text-[#7EB693] text-3xl md:text-4xl">{t('service.videoSubtitle')}</h3>
          <h1 className="text-[#274C5B] font-bold text-4xl md:text-5xl py-4">{t('service.videoTitle')}</h1>
          <p className="text-[#274C5B] max-w-lg mb-8">{t('service.videoDesc')}</p>
          <button
            className="w-24 h-24 cursor-pointer rounded-full flex items-center justify-center text-white text-2xl bg-[#7EB693] hover:bg-[#6aa57e] transition-colors shadow-lg"
            onClick={() => window.open('https://t.me/Abdullohworlds/167', '_blank')}
          >
            <i className="fa-solid fa-play"></i>
          </button>
        </div>
      </article>

      <FooterBottom />
    </>
  )
}
