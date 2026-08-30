import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addToCart, openCart } from '../slices/cartSlice'
import { updateProductRating } from '../Data'
import shopback from '../assets/shop/shopback.webp'
import shopfront from '../assets/shop/shopfront.webp'

export const ShopSingle = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const products = useAppSelector(s => s.data.products)
  const user = useAppSelector(s => s.auth.user)

  const product = products.find(p => p.id === Number(id)) || products[0]
  const related = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4)

  const [quantity, setQuantity] = useState(1)
  const [hoverRating, setHoverRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#274C5B] dark:text-white mb-4">{t('notFound.subtitle')}</p>
            <button onClick={() => navigate('/shop')} className="bg-[#7EB693] text-white px-6 py-3 rounded-xl">
              {t('productDetail.backToShop')}
            </button>
          </div>
        </div>
        <FooterBottom />
      </>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product))
    }
    dispatch(openCart())
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleRate = (rating: number) => {
    if (!user) { navigate('/auth'); return }
    setUserRating(rating)
    dispatch(updateProductRating({ productId: product.id, rating, userId: user.uid }))
  }

  const avgRating = product.userRatings && product.userRatings.length > 0
    ? product.userRatings.reduce((s, r) => s + r.rating, 0) / product.userRatings.length
    : product.rating

  return (
    <>
      <Navbar />
      <header className="w-full h-[300px] bg-cover" style={{ backgroundImage: `url(${shopback})` }}>
        <div className="w-full h-full bg-cover Ajustify-center" style={{ backgroundImage: `url(${shopfront})` }}>
          <h1 className="font-bold text-[#274C5B] text-5xl">{product.name}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-[#274C5B] dark:text-white mb-8 hover:text-[#7EB693] transition-colors font-semibold"
        >
          <i className="fas fa-arrow-left"></i>
          {t('productDetail.backToShop')}
        </button>

        {/* Product Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="bg-[#F9F8F8] dark:bg-[#1e293b] rounded-2xl p-10 flex items-center justify-center min-h-[350px]">
            <img
              src={product.img}
              alt={product.name}
              className="max-w-full max-h-[300px] object-contain"
              width={product.imgWidth ?? 400}
              height={product.imgHeight ?? 400}
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <span className="inline-block bg-[#274C5B] dark:bg-[#7EB693] text-white text-sm px-3 py-1 rounded-lg w-fit">
              {product.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-[#274C5B] dark:text-white">{product.name}</h1>

            {/* Rating Display */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-2xl ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ({product.userRatings?.length || 0} {t('productDetail.reviews')})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="line-through text-gray-400 text-xl">${product.oldPrice}.00</span>
              <span className="text-3xl font-bold text-[#7EB693]">${product.price}.00</span>
              <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-lg font-semibold">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-600 font-semibold text-sm">{t('productDetail.inStock')}</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || t('productDetail.defaultDesc')}
            </p>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-[#274C5B] dark:text-white"
                >−</button>
                <span className="w-12 text-center font-bold text-[#274C5B] dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-[#274C5B] dark:text-white"
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 min-w-[180px] h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${added
                    ? 'bg-green-500 text-white'
                    : 'bg-[#274C5B] dark:bg-[#7EB693] text-white hover:opacity-90'
                  }`}
              >
                <i className={`fas ${added ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                {added ? 'Added!' : t('productDetail.addToCart')}
              </button>
            </div>
          </div>
        </div>

        {/* Rate This Product */}
        <div className="bg-[#F9F8F8] dark:bg-[#1e293b] rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-[#274C5B] dark:text-white mb-4">{t('productDetail.yourRating')}</h3>
          {user ? (
            <div className="flex items-center gap-2 star-rating">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(s)}
                  className={`text-3xl transition-colors star ${s <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >★</button>
              ))}
              {userRating > 0 && (
                <span className="ml-3 text-[#7EB693] font-semibold">{userRating}/5</span>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="text-[#7EB693] font-semibold hover:underline">
              {t('auth.login')} → {t('productDetail.writeReview')}
            </button>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-6">{t('productDetail.relatedProducts')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map(p => (
                <div
                  key={p.id}
                  onClick={() => { navigate(`/shop/${p.id}`); window.scrollTo(0, 0) }}
                  className="productCard bg-[#F9F8F8] dark:bg-[#1e293b] rounded-xl p-4 cursor-pointer shadow hover:shadow-lg transition-all"
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-24 object-contain mb-3"
                    width={p.imgWidth ?? 400}
                    height={p.imgHeight ?? 400}
                    decoding="async"
                    loading="lazy"
                  />
                  <h4 className="font-semibold text-sm text-[#274C5B] dark:text-white truncate">{p.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#7EB693] font-bold text-sm">${p.price}.00</span>
                    <span className="text-yellow-400 text-xs">{'★'.repeat(p.rating)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
