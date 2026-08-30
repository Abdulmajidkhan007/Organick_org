import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppDispatch, useAppSelector } from '../hooks'
import { removeFromCart, increaseQty, decreaseQty, clearCart } from '../slices/cartSlice'
import shopback from '../assets/shop/shopback.webp'
import shopfront from '../assets/shop/shopfront.webp'

export const Cart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector(s => s.cart)

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      <Navbar />
      <header className="w-full h-[300px] bg-cover" style={{ backgroundImage: `url(${shopback})` }}>
        <div className="w-full h-full bg-cover Ajustify-center" style={{ backgroundImage: `url(${shopfront})` }}>
          <h1 className="font-bold text-[#274C5B] text-5xl">{t('cart.title')}</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-4xl text-gray-300"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-3">{t('cart.empty')}</h2>
            <p className="text-gray-400 mb-8">{t('cart.emptyDesc')}</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#274C5B] dark:bg-[#7EB693] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">
                  {count} {count === 1 ? t('cart.item') : t('cart.items')}
                </h2>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i> Clear All
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm flex items-center gap-5">
                    <div className="w-20 h-20 bg-[#F9F8F8] dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <img src={product.img} alt={product.name} className="w-16 h-16 object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs bg-[#274C5B]/10 dark:bg-[#7EB693]/10 text-[#274C5B] dark:text-[#7EB693] px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-[#274C5B] dark:text-white mt-1 mb-1">{product.name}</h4>
                      <p className="text-[#7EB693] font-bold">${product.price}.00</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                        <button
                          onClick={() => dispatch(decreaseQty(product.id))}
                          className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 text-[#274C5B] dark:text-white"
                        >−</button>
                        <span className="w-9 text-center font-bold text-sm text-[#274C5B] dark:text-white">{quantity}</span>
                        <button
                          onClick={() => dispatch(increaseQty(product.id))}
                          className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 text-[#274C5B] dark:text-white"
                        >+</button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#274C5B] dark:text-white">${(product.price * quantity).toFixed(2)}</p>
                        <button
                          onClick={() => dispatch(removeFromCart(product.id))}
                          className="text-red-400 hover:text-red-600 text-xs mt-1 transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 text-[#274C5B] dark:text-white mt-6 hover:text-[#7EB693] transition-colors font-semibold"
              >
                <i className="fas fa-arrow-left"></i>
                {t('cart.continueShopping')}
              </button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-[#274C5B] dark:text-white mb-6">{t('cart.orderSummary')}</h3>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</span>
                    <span className="font-semibold text-[#274C5B] dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</span>
                    <span className="text-[#7EB693] font-semibold">{t('cart.free')}</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-[#274C5B] dark:text-white">{t('cart.total')}</span>
                    <span className="text-[#7EB693]">${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#274C5B] dark:bg-[#7EB693] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <i className="fas fa-lock text-sm"></i>
                  {t('cart.checkout')}
                </button>

                <div className="flex items-center justify-center gap-3 mt-4 text-gray-400 text-xs">
                  <i className="fas fa-lock"></i>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
