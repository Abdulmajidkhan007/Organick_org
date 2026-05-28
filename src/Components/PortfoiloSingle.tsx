import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'

export const PortfoiloSingle = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#274C5B] dark:text-white mb-4">{t('portfolio.title')}</h1>
          <button onClick={() => navigate('/portfoilo')}
            className="bg-[#7EB693] text-white px-6 py-3 rounded-xl font-semibold">
            ← {t('portfolio.subtitle')}
          </button>
        </div>
      </div>
      <FooterTop />
      <FooterBottom />
    </>
  )
}
