import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { closeCart, removeFromCart, increaseQty, decreaseQty } from '../slices/cartSlice'

export const CartSidebar = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, isOpen } = useAppSelector(s => s.cart)

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleCheckout = () => {
    dispatch(closeCart())
    navigate('/cart')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(closeCart())}
      />

      {/* Sidebar */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''} z-[1001]`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">
            {t('cart.title')} ({count} {count === 1 ? t('cart.item') : t('cart.items')})
          </h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-times text-sm text-[#274C5B] dark:text-white"></i>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i className="fas fa-shopping-cart text-3xl text-gray-300"></i>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('cart.empty')}</p>
              <p className="text-sm text-gray-400">{t('cart.emptyDesc')}</p>
              <button
                onClick={() => { dispatch(closeCart()); navigate('/shop') }}
                className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#6aa57e] transition-colors"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <img src={product.img} alt={product.name} className="w-16 h-16 object-contain rounded-lg bg-white" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#274C5B] dark:text-white truncate">{product.name}</h4>
                    <p className="text-[#7EB693] font-bold text-sm">${product.price}.00</p>
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => dispatch(decreaseQty(product.id))}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 transition-colors"
                      >−</button>
                      <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => dispatch(increaseQty(product.id))}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-sm text-[#274C5B] dark:text-white">${(product.price * quantity).toFixed(2)}</span>
                    <button
                      onClick={() => dispatch(removeFromCart(product.id))}
                      className="text-red-400 hover:text-red-600 transition-colors text-xs"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{t('cart.subtotal')}</span>
              <span className="font-semibold text-[#274C5B] dark:text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{t('cart.shipping')}</span>
              <span className="text-[#7EB693] font-semibold text-sm">{t('cart.free')}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span className="text-[#274C5B] dark:text-white">{t('cart.total')}</span>
              <span className="text-[#7EB693]">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#274C5B] dark:bg-[#7EB693] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity mb-2"
            >
              {t('cart.checkout')}
            </button>
            <button
              onClick={() => dispatch(closeCart())}
              className="w-full border border-gray-300 dark:border-gray-600 text-[#274C5B] dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
