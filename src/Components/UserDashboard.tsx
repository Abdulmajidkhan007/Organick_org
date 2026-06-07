import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom } from './Footer'
import { useAppSelector } from '../hooks'
import { getStatusStyle } from './Checkout'
import { subscribeUserOrders } from '../firebase/firestore'
import { Order } from '../types'

const DetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const st = getStatusStyle(order.status)
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-lg text-[#274C5B] dark:text-white">{order.id}</h3>
            <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <i className="fas fa-times text-sm text-gray-600 dark:text-white"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${st.color}`}>{st.label}</span>
          </div>

          <div className="bg-[#F9F8F8] dark:bg-gray-800 rounded-xl p-4 space-y-1">
            <p className="text-sm"><span className="font-semibold text-[#274C5B] dark:text-[#7EB693]">👤 Ism:</span> <span className="text-gray-700 dark:text-gray-300">{order.customerName}</span></p>
            <p className="text-sm"><span className="font-semibold text-[#274C5B] dark:text-[#7EB693]">📱 Tel:</span> <span className="text-gray-700 dark:text-gray-300">{order.customerPhone}</span></p>
            <p className="text-sm"><span className="font-semibold text-[#274C5B] dark:text-[#7EB693]">🏠 Manzil:</span> <span className="text-gray-700 dark:text-gray-300">{order.customerAddress}</span></p>
            {order.customerTelegram && (
              <p className="text-sm"><span className="font-semibold text-[#274C5B] dark:text-[#7EB693]">💬 Telegram:</span> <span className="text-gray-700 dark:text-gray-300">{order.customerTelegram}</span></p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-[#274C5B] dark:text-white mb-2">📦 Mahsulotlar</h4>
            <div className="flex flex-col gap-2">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 bg-[#F9F8F8] dark:bg-gray-800 rounded-xl p-3">
                  <img src={item.productImg} alt={item.productName} className="w-12 h-12 object-contain rounded-lg bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#274C5B] dark:text-white truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">x{item.quantity} × ${item.price}</p>
                  </div>
                  <span className="font-bold text-[#7EB693] text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-4">
            <span className="text-[#274C5B] dark:text-white">Jami:</span>
            <span className="text-[#7EB693]">${order.total.toFixed(2)}</span>
          </div>

          {order.adminNote && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                <i className="fas fa-info-circle mr-1"></i> Admin xabari:
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">{order.adminNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const UserDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeUserOrders(user.uid || '', user.email || '', setUserOrders)
    return unsub
  }, [user])

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F8] dark:bg-[#0f172a] px-4">
          <div className="text-center">
            <i className="fas fa-user-lock text-5xl text-gray-300 mb-4 block"></i>
            <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-3">{t('dashboard.loginRequired')}</h2>
            <button onClick={() => navigate('/auth')} className="bg-[#274C5B] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90">
              {t('nav.login')}
            </button>
          </div>
        </div>
        <FooterBottom />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F9F8F8] dark:bg-[#0f172a]">
        {/* Header */}
        <div className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#7EB693] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
              }
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#274C5B] dark:text-white">{user.displayName || user.email}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {user.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="ml-auto flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
              >
                <i className="fas fa-cog"></i> {t('nav.admin')}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('dashboard.totalOrders'), value: userOrders.length, icon: 'fa-box', color: 'text-[#274C5B] dark:text-white' },
              { label: t('dashboard.pending'), value: userOrders.filter(o => o.status === 'pending').length, icon: 'fa-clock', color: 'text-yellow-600' },
              { label: t('dashboard.delivered'), value: userOrders.filter(o => o.status === 'delivered').length, icon: 'fa-check-circle', color: 'text-green-600' },
              { label: t('dashboard.totalSpent'), value: `$${userOrders.reduce((s, o) => s + o.total, 0).toFixed(0)}`, icon: 'fa-wallet', color: 'text-[#7EB693]' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm">
                <i className={`fas ${s.icon} text-xl ${s.color} mb-2 block`}></i>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Orders List */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-[#274C5B] dark:text-white text-lg">{t('dashboard.myOrders')}</h2>
              <button
                onClick={() => navigate('/shop')}
                className="text-sm text-[#7EB693] font-semibold hover:underline"
              >
                {t('cart.continueShopping')} →
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="py-16 text-center">
                <i className="fas fa-shopping-bag text-4xl text-gray-200 mb-4 block"></i>
                <p className="text-gray-400 font-semibold">{t('dashboard.noOrders')}</p>
                <button onClick={() => navigate('/shop')} className="mt-4 bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:opacity-90">
                  {t('dashboard.shopNow')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {userOrders.map(order => {
                  const st = getStatusStyle(order.status)
                  return (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelected(order)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#274C5B]/10 dark:bg-[#7EB693]/10 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-box text-[#274C5B] dark:text-[#7EB693]"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-[#274C5B] dark:text-white">{order.id}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.items.length} mahsulot • {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        {order.adminNote && (
                          <p className="text-xs text-blue-500 mt-0.5 truncate">
                            <i className="fas fa-comment-alt mr-1"></i>{order.adminNote}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[#7EB693]">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          <i className="fas fa-chevron-right"></i>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && <DetailModal order={selected} onClose={() => setSelected(null)} />}
      <FooterBottom />
    </>
  )
}
