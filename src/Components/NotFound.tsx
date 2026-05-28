import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom } from './Footer'
import NotFoundback from '../assets/NotFoundback.png'
import NotFoundfront from '../assets/NotFoundfront.png'

export const NotFound = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <main style={{ backgroundImage: `url(${NotFoundback})` }} className="w-full h-[80vh] bg-cover bg-center">
        <div style={{ backgroundImage: `url(${NotFoundfront})` }} className="w-full h-full bg-cover bg-center flex justify-end">
          <div className="w-full max-w-lg flex flex-col items-start gap-4 px-8 py-16 justify-center">
            <h1 className="text-[100px] md:text-[150px] text-[#8FA8A8] font-bold leading-none">404</h1>
            <p className="text-2xl md:text-4xl text-[#274C5B] dark:text-white font-bold">{t('notFound.subtitle')}</p>
            <p className="text-[#274C5B] dark:text-gray-300">{t('notFound.desc')}</p>
            <button
              onClick={() => navigate('/')}
              className="w-[200px] h-[60px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 font-bold hover:bg-[#1d3a47] transition-colors mt-4"
            >
              {t('notFound.backHome')}
              <i className="fas fa-arrow-right bg-[#335B6B] rounded-full text-xs p-1"></i>
            </button>
          </div>
        </div>
      </main>
      <FooterBottom />
    </>
  )
}
