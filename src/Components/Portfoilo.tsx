import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppSelector } from '../hooks'
import PortfoiloHeaderBack from '../assets/portfoilo/PortfoiloHeaderBack.webp'
import PortfoiloHeaderFront from '../assets/portfoilo/PortfoiloHeaderFront.webp'

export const Portfoilo = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const portfoilos = useAppSelector(s => s.data.portfoilos)

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${PortfoiloHeaderBack})` }} className="w-full h-[50vh] bg-cover">
        <div style={{ backgroundImage: `url(${PortfoiloHeaderFront})` }} className="w-full h-full bg-cover Ajustify-center">
          <h1 className="font-bold text-[#274C5B] text-4xl md:text-5xl">{t('portfolio.subtitle')}</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {portfoilos.map((portfoilo, index) => (
            <div key={portfoilo.id} role="portfoiloCard" className="gap-2 shadow-lg p-1 rounded-2xl Ajustify-center-col overflow-hidden">
              <div className="portfoiloImage w-full h-64 relative overflow-hidden Ajustify-center">
                <img
                  src={portfoilo.img}
                  alt={portfoilo.name}
                  className="w-full h-full absolute rounded-2xl object-cover"
                  width={451}
                  height={421}
                  decoding="async"
                  loading={index === 0 ? undefined : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                />
                <div role="portfoiloNavigate"
                     className="w-[85%] h-[85%] rounded-2xl absolute z-10 bg-[#ffffffd8] Ajustify-center opacity-0">
                  <button
                    type="button"
                    role="portfoiloNavigateButton"
                    onClick={() => navigate('/portfoilosingle')}
                    className="w-10 h-10 bg-[#7EB693] text-white rounded-full Ajustify-center"
                  >
                    <i role="portfoiloNavigateButtonIcon" className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div className="w-full py-3 px-2">
                <h2 className="text-lg font-bold text-[#274C5B] dark:text-white">{portfoilo.name}</h2>
                <h3 className="font-[YellowTail] text-[#7EB693]">{portfoilo.job}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
