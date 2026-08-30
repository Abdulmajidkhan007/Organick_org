import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addToCart, openCart } from '../slices/cartSlice'
import { Product } from '../types'

import back from '../assets/home/back.webp'
import card1 from '../assets/home/card1.webp'
import card2 from '../assets/home/card2.webp'
import aboutUs from '../assets/home/aboutUs.webp'
import veganFood from '../assets/home/veganFood.webp'
import mailboxQuality from '../assets/home/mailboxQuality.webp'
import Testimonialbackground from '../assets/home/TestimonialBackground.webp'
import TestimonialHuman from '../assets/home/TestimonialHuman.webp'
import ecoFriendly from '../assets/home/ecoFriendly.webp'
import OrganicJuice from '../assets/home/OrganicJuice.webp'
import OrganicFood from '../assets/home/OrganicFood.webp'
import NutsCookis from '../assets/home/NutsCookis.webp'

export const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const products = useAppSelector(s => s.data.products)
  const blogs = useAppSelector(s => s.data.blogs)

  const featuredImages = [
    { img: OrganicJuice, name: t('home.categories.title') },
    { img: OrganicFood, name: t('home.offer.title') },
    { img: NutsCookis, name: t('about.whyUs.fresh') },
  ]

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    dispatch(addToCart(product))
    dispatch(openCart())
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <main
        style={{ backgroundImage: `url(${back})` }}
        className="w-full h-[80vh] bg-cover bg-center bg-no-repeat flex items-center pl-6 sm:pl-16 md:pl-28 lg:pl-44"
      >
        <article className="w-full max-w-lg flex flex-col gap-4">
          <h3 className="text-[#7EB693] font-[YellowTail] text-2xl md:text-3xl">{t('home.hero.subtitle')}</h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#274C5B]">{t('home.hero.title')}</h1>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="w-[160px] h-[50px] rounded-2xl text-[#274C5B] bg-[#EFD372] flex items-center justify-center gap-2 font-bold hover:bg-[#dbc55e] transition-colors"
          >
            {t('home.hero.exploreBtn')}
            <div className="w-[25px] h-[25px] flex items-center justify-center bg-[#274C5B] rounded-full text-white text-[13px]">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </article>
      </main>

      {/* Banner Cards */}
      <article className="cards w-full py-12 flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
        <div style={{ backgroundImage: `url(${card1})` }}
             className="w-full max-w-[500px] h-[250px] sm:h-[300px] bg-cover bg-center rounded-3xl flex items-center pl-10">
          <div className="text-white">
            <h3 className="font-[YellowTail] text-2xl md:text-3xl">{t('home.cards.natural')}</h3>
            <h1 className="font-bold text-2xl md:text-3xl">{t('home.cards.freshFruits')}</h1>
          </div>
        </div>
        <div style={{ backgroundImage: `url(${card2})` }}
             className="w-full max-w-[500px] h-[250px] sm:h-[300px] bg-cover bg-center rounded-3xl flex items-center pl-10">
          <div>
            <h3 className="text-[#7EB693] font-[YellowTail] text-xl md:text-2xl">{t('home.cards.offer')}</h3>
            <h1 className="text-[#274C5B] font-bold text-2xl md:text-3xl">{t('home.cards.discount')}</h1>
          </div>
        </div>
      </article>

      {/* About Us */}
      <article className="w-full py-16 bg-[#EFF6F1] dark:bg-[#1e293b] flex flex-col md:flex-row items-center px-6 lg:px-20">
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
          <img src={aboutUs} alt="About Us" className="max-w-full h-auto" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h3 className="text-[#7EB693] font-[YellowTail] text-2xl">{t('home.aboutUs.subtitle')}</h3>
          <h1 className="text-3xl md:text-4xl font-bold text-[#274C5B] dark:text-white">{t('home.aboutUs.title')}</h1>
          <p className="text-[#274C5B] dark:text-gray-300">{t('home.aboutUs.description')}</p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="flex items-center gap-4 h-20">
              <div className="flex-shrink-0 w-20 h-full rounded-lg flex items-center justify-center bg-white dark:bg-[#0f172a]">
                <img src={veganFood} alt="" className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-[#274C5B] dark:text-white font-bold text-lg">{t('home.aboutUs.veganFood.title')}</h3>
                <p className="text-[#274C5B] dark:text-gray-300 text-sm">{t('home.aboutUs.veganFood.desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 h-20">
              <div className="flex-shrink-0 w-20 h-full rounded-lg flex items-center justify-center bg-white dark:bg-[#0f172a]">
                <img src={mailboxQuality} alt="" className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-[#274C5B] dark:text-white font-bold text-lg">{t('home.aboutUs.quality.title')}</h3>
                <p className="text-[#274C5B] dark:text-gray-300 text-sm">{t('home.aboutUs.quality.desc')}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-[150px] h-[50px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 font-bold hover:bg-[#1d3a47] transition-colors mt-2"
          >
            {t('home.aboutUs.shopBtn')}
            <div className="w-[22px] h-[22px] flex items-center justify-center bg-[#335b6b] rounded-full text-white text-xs">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </article>

      {/* Products */}
      <article className="w-full py-16 px-4 lg:px-20 text-center">
        <h3 className="font-[YellowTail] text-3xl text-[#7EB693]">{t('home.categories.title')}</h3>
        <h1 className="font-bold text-[#274C5B] dark:text-white text-3xl md:text-4xl mb-10">{t('home.categories.ourProducts')}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map(product => (
            <div
              key={product.id}
              onClick={() => navigate(`/shop/${product.id}`)}
              className="productCard bg-[#F9F8F8] dark:bg-[#1e293b] shadow-md rounded-2xl Ajustify-center-col cursor-pointer overflow-hidden"
            >
              <div className="w-full flex justify-start p-4">
                <p className="text-white bg-[#274C5B] dark:bg-[#7EB693] inline px-3 py-1 rounded-lg text-sm">
                  {product.category}
                </p>
              </div>
              <div className="w-full flex items-center justify-center px-6 pb-2 h-32">
                <img src={product.img} alt={product.name} className="max-h-full object-contain" />
              </div>
              <div className="w-full p-4 border-t border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-[#274C5B] dark:text-white mb-1 truncate">{product.name}</h2>
                <hr className="border-gray-200 dark:border-gray-600 mb-2" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="line-through text-gray-400 text-xs">${product.oldPrice}.00</span>
                    <span className="font-bold text-[#274C5B] dark:text-[#7EB693] text-sm">${product.price}.00</span>
                  </div>
                  <div className="text-yellow-400 text-xs">{'★'.repeat(product.rating)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="w-[160px] h-[55px] rounded-xl bg-[#274C5B] text-white flex items-center justify-center gap-2 mt-10 mx-auto font-bold hover:bg-[#1d3a47] transition-colors"
        >
          {t('home.categories.loadMore')}
          <div className="w-[22px] h-[22px] flex items-center justify-center bg-[#335b6b] rounded-full text-white text-xs">
            <i className="fas fa-arrow-right"></i>
          </div>
        </button>
      </article>

      {/* Testimonial */}
      <article
        style={{ backgroundImage: `url(${Testimonialbackground})` }}
        className="w-full py-16 bg-cover flex items-center justify-center"
      >
        <div className="w-full max-w-4xl mx-4 flex flex-col items-center gap-6">
          <div className="text-[#274C5B] text-center flex flex-col items-center gap-3">
            <h3 className="text-[#7EB693] font-[YellowTail] text-2xl">{t('home.testimonials.title')}</h3>
            <h1 className="text-3xl md:text-4xl font-bold">{t('home.testimonials.subtitle')}</h1>
            <img src={TestimonialHuman} alt="Customer" className="rounded-full w-20 h-20 object-cover mt-4" />
            <span className="text-yellow-400 text-xl">{'★'.repeat(5)}</span>
            <p className="max-w-lg text-center text-[#274C5B]">
              Simply dummy text of the printing and typesetting industry. Lorem Ipsum simply dummy text.
            </p>
            <h1 className="text-xl font-bold">Sara Taylor</h1>
            <p className="text-gray-500">Consumer</p>
          </div>
          <hr className="border-gray-300 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {[
              { num: '100%', label: t('home.testimonials.organic') },
              { num: '285', label: t('home.testimonials.activeProduct') },
              { num: '350+', label: t('home.testimonials.organicOrchards') },
              { num: '25+', label: t('home.testimonials.yearsOfFarming') },
            ].map((stat, i) => (
              <div key={i} className="Ajustify-center-col w-full h-32 border-3 border-[#7EB693] rounded-full bg-[#F1F1F1] dark:bg-[#1e293b] text-[#274C5B] dark:text-white">
                <h1 className="font-bold text-2xl md:text-4xl">{stat.num}</h1>
                <p className="font-medium text-xs md:text-sm text-center px-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Offer Section */}
      <article className="w-full py-16 px-4 lg:px-20 bg-[#274C5B] flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h1 className="font-[YellowTail] text-3xl text-[#7EB693]">{t('home.offer.title')}</h1>
            <h1 className="text-white text-3xl md:text-4xl font-bold">{t('home.offer.subtitle')}</h1>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-[150px] h-[55px] rounded-xl bg-[#EFD372] text-white flex items-center justify-center gap-2 font-bold hover:opacity-90"
          >
            {t('home.offer.loadMore')}
            <div className="w-[22px] h-[22px] flex items-center justify-center bg-[#274C5B] rounded-full text-white text-xs">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
          {products.slice(12, 16).map(product => (
            <div
              key={product.id}
              onClick={() => navigate(`/shop/${product.id}`)}
              className="productCard bg-[#F9F8F8] shadow-lg rounded-2xl Ajustify-center-col cursor-pointer"
            >
              <div className="w-full flex justify-start p-4">
                <p className="text-white bg-[#274C5B] inline px-3 py-1 rounded-lg text-sm">{product.category}</p>
              </div>
              <div className="w-full flex items-center justify-center px-6 pb-2 h-28">
                <img src={product.img} alt={product.name} className="max-h-full object-contain" />
              </div>
              <div className="w-full p-4 border-t border-gray-100">
                <h2 className="text-sm font-semibold text-[#274C5B] mb-1 truncate">{product.name}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="line-through text-gray-400 text-xs">${product.oldPrice}.00</span>
                    <span className="font-bold text-[#274C5B] text-sm">${product.price}.00</span>
                  </div>
                  <div className="text-yellow-400 text-xs">{'★'.repeat(product.rating)}</div>
                </div>
                <button
                  onClick={e => handleAddToCart(e, product)}
                  className="w-full mt-2 py-1.5 bg-[#274C5B] text-white rounded-lg text-xs font-bold hover:opacity-90"
                >
                  <i className="fas fa-shopping-cart mr-1"></i>
                  {t('shop.addToCart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Eco Friendly */}
      <article className="w-full flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${ecoFriendly})` }}></div>
        <div className="w-full md:w-1/2 flex items-center p-6 lg:p-16">
          <div className="w-full text-[#274C5B] dark:text-white">
            <h3 className="font-[YellowTail] text-[#7EB693] text-3xl">{t('home.ecoFriendly.subtitle')}</h3>
            <h1 className="font-bold text-3xl md:text-4xl py-4">{t('home.ecoFriendly.title')}</h1>
            {[1,2,3].map(n => (
              <div key={n} className="py-3">
                <h2 className="font-bold text-lg">{t(`home.ecoFriendly.step${n}Title`)}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t(`home.ecoFriendly.step${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Featured Categories */}
      <article className="w-full py-12 bg-[#F1F8F4] dark:bg-[#1e293b] px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredImages.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-center h-48 bg-cover bg-center rounded-2xl overflow-hidden"
              style={{ backgroundImage: `url(${item.img})` }}
            >
              <h1 className="px-8 py-3 font-semibold rounded-xl text-[#274C5B] bg-white/90 text-center">{item.name}</h1>
            </div>
          ))}
        </div>
      </article>

      {/* News/Blog */}
      <article className="w-full py-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h3 className="text-[#7EB693] font-[YellowTail] text-3xl">{t('home.news.subtitle')}</h3>
            <h1 className="text-[#274C5B] dark:text-white font-bold text-3xl md:text-4xl max-w-lg">{t('home.news.title')}</h1>
          </div>
          <button
            onClick={() => navigate('/blog')}
            className="flex-shrink-0 w-[150px] h-[55px] rounded-xl text-[#274C5B] dark:text-white flex items-center justify-center gap-2 border-2 border-[#274C5B] dark:border-white font-bold hover:bg-[#274C5B] hover:text-white transition-colors"
          >
            {t('home.news.moreNews')}
            <div className="w-[22px] h-[22px] flex items-center justify-center bg-[#274C5B] rounded-full text-white text-xs">
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16">
          {blogs.slice(0, 2).map(blog => (
            <div key={blog.id} className="rounded-2xl flex flex-col items-center justify-end relative h-72 bg-cover bg-center"
                 style={{ backgroundImage: `url(${blog.img})` }}>
              <div className="absolute top-3 left-3 bg-white rounded-full w-16 h-16 font-bold text-[#274C5B] text-sm flex items-center text-center justify-center p-1 leading-tight">
                {blog.date}
              </div>
              <div className="w-[90%] rounded-2xl bg-white dark:bg-[#1e293b] shadow-2xl p-6 -mb-10 text-[#274C5B] dark:text-white">
                <p className="text-sm font-semibold mb-1"><i className="fa-solid fa-user text-[#EFD372] mr-1"></i>{blog.user}</p>
                <h3 className="font-bold text-base mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{blog.description}</p>
                <button
                  onClick={() => navigate('/blog')}
                  className="mt-3 flex items-center gap-2 font-bold text-sm hover:text-[#7EB693] transition-colors"
                >
                  {t('home.news.readMore')}
                  <span className="flex items-center justify-center rounded-full text-white bg-[#274C5B] dark:bg-[#7EB693] p-1 text-xs">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
