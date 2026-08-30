import { useTranslation } from 'react-i18next'
import { FooterBottom, FooterTop } from './Footer'
import { Navbar } from './Navbar'
import { useAppSelector } from '../hooks'
import TeamHeaderBack from '../assets/Team/TeamHeaderBack.webp'
import TeamHeaderFront from '../assets/Team/TeamHeaderFront.webp'

export const Team = () => {
  const { t } = useTranslation()
  const teams = useAppSelector(s => s.data.teams)

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${TeamHeaderBack})` }} className="w-full h-[318px] bg-center bg-contain bg-no-repeat">
        <div style={{ backgroundImage: `url(${TeamHeaderFront})` }} className="w-full h-[318px] bg-center bg-contain bg-no-repeat Ajustify-center">
          <h1 className="text-[#274C5B] font-bold text-4xl md:text-5xl">{t('team.title')}</h1>
        </div>
      </header>

      <article className="w-full py-16 px-4 flex flex-col items-center">
        <h1 className="font-[YellowTail] text-[#7EB693] text-4xl">{t('team.title')}</h1>
        <h1 className="text-[#274C5B] dark:text-white text-3xl md:text-5xl font-bold my-3">{t('team.subtitle')}</h1>
        <p className="max-w-2xl text-center text-[#274C5B] dark:text-gray-300 mb-10">{t('team.desc')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {teams.map((team, i) => (
            <figure key={i} className="overflow-hidden bg-[#F9F9F9] dark:bg-[#1e293b] rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
              <img
                src={team.team}
                alt={team.name}
                className="w-full"
                width={449}
                height={485}
                decoding="async"
                loading={i === 0 ? undefined : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
              />
              <figcaption className="p-4">
                <h2 className="text-[#274C5B] dark:text-white font-bold">{team.name}</h2>
                <div className="w-full flex justify-between items-center mt-1">
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
      </article>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
