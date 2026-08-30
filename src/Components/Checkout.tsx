import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom } from './Footer'
import { useAppDispatch, useAppSelector } from '../hooks'
import { clearCart } from '../slices/cartSlice'
import { decreaseStock } from '../Data'
import { sendTelegram } from '../utils/telegram'
import { addOrderToFirestore } from '../firebase/firestore'
import { addOrder } from '../slices/ordersSlice'
import { Order, OrderItem } from '../types'
import shopback from '../assets/shop/shopback.webp'
import shopfront from '../assets/shop/shopfront.webp'

const ORDER_STATUSES = [
  { key: 'pending',    label: 'Kutilmoqda',   color: 'bg-yellow-100 text-yellow-700' },
  { key: 'confirmed',  label: 'Tasdiqlandi',  color: 'bg-blue-100 text-blue-700' },
  { key: 'processing', label: 'Tayyorlanmoqda', color: 'bg-purple-100 text-purple-700' },
  { key: 'shipped',    label: 'Yuborildi',    color: 'bg-cyan-100 text-cyan-700' },
  { key: 'delivered',  label: 'Yetkazildi',   color: 'bg-green-100 text-green-700' },
  { key: 'cancelled',  label: 'Bekor qilindi', color: 'bg-red-100 text-red-700' },
]
export const getStatusStyle = (status: string) =>
  ORDER_STATUSES.find(s => s.key === status) || ORDER_STATUSES[0]

export const Checkout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector(s => s.cart)
  const user = useAppSelector(s => s.auth.user)

  const [form, setForm] = useState({
    name: user?.displayName || '',
    phone: user?.phoneNumber || '',
    address: '',
    telegram: '',
  })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 9

  const handleOrder = async () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Ism kiritish shart"
    if (!form.phone.trim()) errs.phone = "Telefon raqam kiritish shart"
    else if (!validatePhone(form.phone)) errs.phone = "Telefon raqam noto'g'ri (kamida 9 ta raqam kerak, masalan: +998901234567)"
    if (!form.address.trim()) errs.address = "Manzil kiritish shart"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const id = 'ORD-' + Date.now().toString(36).toUpperCase()
    const orderItems: OrderItem[] = items.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      productImg: i.product.img,
      price: i.product.price,
      quantity: i.quantity,
    }))

    const order: Order = {
      id,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      customerName: form.name,
      customerPhone: form.phone,
      customerAddress: form.address,
      customerTelegram: form.telegram || undefined,
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage immediately (fallback if Firestore fails)
    dispatch(addOrder(order))

    // Try Firestore, but don't block order if it fails
    try {
      await addOrderToFirestore(order)
    } catch (e) {
      console.warn('[Firestore] Order write failed (permission?), saved to localStorage:', e)
    }

    items.forEach(i => dispatch(decreaseStock({ productId: i.product.id, quantity: i.quantity })))

    const itemLines = orderItems
      .map(i => `• ${i.productName} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join('\n')

    const text = [
      `🛒 <b>YANGI BUYURTMA #${id}</b>`,
      '',
      `👤 Ism: ${form.name}`,
      `📱 Tel: ${form.phone}`,
      `🏠 Manzil: ${form.address}`,
      form.telegram ? `💬 Telegram: ${form.telegram}` : '',
      '',
      `📦 Mahsulotlar:\n${itemLines}`,
      '',
      `💰 Jami: $${subtotal.toFixed(2)}`,
      `🕐 Vaqt: ${new Date().toLocaleString('ru-RU')}`,
    ].filter(Boolean).join('\n')

    try {
      await sendTelegram(text, import.meta.env.VITE_TELEGRAM_THREAD_ID_ORDERS)
    } catch (e) {
      console.warn('[Telegram] Notification failed:', e)
    }

    dispatch(clearCart())
    setOrderId(id)
    setLoading(false)
  }

  if (orderId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F9F8F8] dark:bg-[#0f172a] flex items-center justify-center px-4 py-16">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-10 max-w-md w-full text-center shadow-lg slide-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-green-600 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-2">{t('checkout.success')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('checkout.successDesc')}</p>
            <div className="bg-[#F9F8F8] dark:bg-gray-800 rounded-xl px-6 py-3 mb-6 inline-block">
              <p className="text-sm text-gray-500">{t('checkout.orderId')}</p>
              <p className="text-xl font-bold text-[#274C5B] dark:text-[#7EB693]">{orderId}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('checkout.telegramNote')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-[#7EB693] text-white py-3 rounded-xl font-bold hover:opacity-90"
                >
                  <i className="fas fa-list-alt mr-2"></i>{t('checkout.viewOrders')}
                </button>
              )}
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 border-2 border-[#274C5B] dark:border-[#7EB693] text-[#274C5B] dark:text-[#7EB693] py-3 rounded-xl font-bold hover:bg-[#274C5B] hover:text-white transition-colors"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        </div>
        <FooterBottom />
      </>
    )
  }

  if (items.length === 0) {
    navigate('/shop')
    return null
  }

  return (
    <>
      <Navbar />
      <header className="w-full h-[220px] bg-cover" style={{ backgroundImage: `url(${shopback})` }}>
        <div className="w-full h-full bg-cover Ajustify-center" style={{ backgroundImage: `url(${shopfront})` }}>
          <h1 className="font-bold text-[#274C5B] text-4xl">{t('checkout.title')}</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#274C5B] dark:text-white mb-6">{t('checkout.deliveryInfo')}</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    {t('checkout.name')} *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={`inpHover w-full h-12 ${errors.name ? 'border-red-400 focus:border-red-400' : ''}`}
                    placeholder={t('checkout.namePlaceholder')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className={`inpHover w-full h-12 ${errors.phone ? 'border-red-400 focus:border-red-400' : ''}`}
                    placeholder="+998 90 123 45 67"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    {t('checkout.address')} *
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    className={`inpHover w-full ${errors.address ? 'border-red-400 focus:border-red-400' : ''}`}
                    placeholder={t('checkout.addressPlaceholder')}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    {t('checkout.telegram')}
                    <span className="text-gray-400 font-normal ml-1">({t('checkout.optional')})</span>
                  </label>
                  <input
                    type="text"
                    value={form.telegram}
                    onChange={e => set('telegram', e.target.value)}
                    className="inpHover w-full h-12"
                    placeholder="@username"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('checkout.telegramHint')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-[#274C5B] dark:text-white mb-4">{t('cart.orderSummary')}</h3>
              <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F9F8F8] dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-10 h-10 object-contain"
                        width={40}
                        height={40}
                        decoding="async"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#274C5B] dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <span className="font-bold text-sm text-[#7EB693] flex-shrink-0">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 dark:border-gray-700 mb-4" />
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">{t('cart.subtotal')}</span>
                <span className="font-semibold text-[#274C5B] dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span className="text-[#7EB693] font-semibold">{t('cart.free')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span className="text-[#274C5B] dark:text-white">{t('cart.total')}</span>
                <span className="text-[#7EB693]">${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-[#274C5B] dark:bg-[#7EB693] text-white py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {t('checkout.placing')}</>
                ) : (
                  <><i className="fas fa-check"></i> {t('checkout.placeOrder')}</>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-xs">
                <i className="fas fa-lock"></i>
                <span>{t('checkout.secure')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterBottom />
    </>
  )
}
