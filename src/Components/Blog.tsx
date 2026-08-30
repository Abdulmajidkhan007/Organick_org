import { useTranslation } from 'react-i18next'
import { FooterBottom, FooterTop } from './Footer'
import { Navbar } from './Navbar'
import { useAppSelector } from '../hooks'
import BlogHeaderBack from '../assets/blog/BlogHeaderBack.webp'
import BlogHeaderFront from '../assets/blog/BlogHeaderFront.webp'

export const Blog = () => {
  const { t } = useTranslation()
  const blogs = useAppSelector(s => s.data.blogs)

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${BlogHeaderBack})` }} className="w-full h-[50vh] bg-cover">
        <div style={{ backgroundImage: `url(${BlogHeaderFront})` }} className="w-full h-full bg-cover Ajustify-center">
          <h1 className="font-bold text-[#274C5B] text-4xl md:text-5xl">{t('blog.title')}</h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20">
          {blogs.map(blog => (
            <div key={blog.id} className="rounded-2xl flex flex-col items-center justify-end relative h-72 bg-cover bg-center"
                 style={{ backgroundImage: `url(${blog.img})` }}>
              <div className="absolute top-3 left-3 bg-white rounded-full w-16 h-16 font-bold text-[#274C5B] text-sm flex items-center justify-center text-center p-1 leading-tight">
                {blog.date}
              </div>
              <div className="w-[90%] rounded-2xl -mb-10 bg-white dark:bg-[#1e293b] shadow-2xl p-6 text-[#274C5B] dark:text-white">
                <p className="font-semibold text-sm mb-1">
                  <i className="fa-solid fa-user text-[#7EB693] mr-1"></i> {blog.user}
                </p>
                <h3 className="font-bold text-base mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{blog.description}</p>
                <button className="mt-3 flex items-center gap-2 font-bold text-sm hover:text-[#7EB693] transition-colors">
                  {t('blog.readMore')}
                  <span className="flex items-center justify-center rounded-full text-white bg-[#274C5B] dark:bg-[#7EB693] p-1 text-xs">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-16"></div>
      <FooterTop />
      <FooterBottom />
    </>
  )
}
