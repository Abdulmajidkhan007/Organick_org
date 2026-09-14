import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../hooks'
import { subscribeAllOrders } from '../../firebase/firestore'
import { Order } from '../../types'
import { StatsTab } from './StatsTab'
import { OrdersTab } from './OrdersTab'
import { ProductsTab } from './ProductsTab'
import { BlogsTab } from './BlogsTab'

export type AdminTab = 'dashboard' | 'products' | 'blogs' | 'orders'

export const AdminDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const unsub = subscribeAllOrders(setOrders)
    return unsub
  }, [])

  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <i className="fas fa-lock text-5xl text-gray-300 mb-4 block"></i>
          <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-2">{t('admin.accessDenied')}</h2>
          <p className="text-gray-500 mb-6">{t('admin.accessDeniedDesc')}</p>
          <button onClick={() => navigate('/auth')} className="bg-[#274C5B] text-white px-6 py-3 rounded-xl font-semibold">
            {t('nav.login')}
          </button>
        </div>
      </div>
    )
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <i className="fas fa-user-slash text-5xl text-red-300 mb-4 block"></i>
          <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-2">{t('admin.accessDenied')}</h2>
          <p className="text-gray-500 mb-2">{t('admin.notAdmin')}</p>
          <p className="text-gray-400 text-sm mb-6">Logged in as: {user.email || user.phoneNumber}</p>
          <button onClick={() => navigate('/')} className="bg-[#274C5B] text-white px-6 py-3 rounded-xl font-semibold">
            {t('nav.home')}
          </button>
        </div>
      </div>
    )
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length

  const navItems = [
    { key: 'dashboard' as AdminTab, icon: 'fa-chart-line', label: t('admin.dashboard') },
    { key: 'orders' as AdminTab,    icon: 'fa-shopping-bag', label: t('admin.orders'), badge: pendingCount },
    { key: 'products' as AdminTab,  icon: 'fa-box', label: t('admin.products') },
    { key: 'blogs' as AdminTab,     icon: 'fa-newspaper', label: t('admin.blogs') },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f172a]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`admin-sidebar flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-50 md:relative md:inset-auto md:z-auto
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16 w-64'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && <span className="font-bold text-lg">Organick Admin</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors ml-auto"
          >
            <i className={`fas fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'} text-sm`}></i>
          </button>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); if (window.innerWidth < 768) setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-semibold text-sm
                ${tab === item.key ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="relative flex-shrink-0 w-5 flex items-center justify-center">
                <i className={`fas ${item.icon} text-base`}></i>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
          <hr className="border-white/20 my-2" />
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors font-semibold text-sm"
          >
            <i className="fas fa-home text-base w-5 flex-shrink-0 text-center"></i>
            {sidebarOpen && <span>{t('nav.home')}</span>}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors font-semibold text-sm"
          >
            <i className="fas fa-user text-base w-5 flex-shrink-0 text-center"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </button>
        </nav>
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {(user.displayName || user.email || user.phoneNumber || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.displayName || user.email || user.phoneNumber}</p>
                <p className="text-xs text-white/60">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#274C5B] text-white flex items-center justify-center flex-shrink-0"
            >
              <i className="fas fa-bars text-sm"></i>
            </button>
            <h1 className="text-2xl font-bold text-[#274C5B] dark:text-white">{t('admin.title')}</h1>
          </div>

          {tab === 'dashboard' && (
            <StatsTab
              orders={orders}
              pendingCount={pendingCount}
              setTab={setTab}
              setShowProductForm={setShowProductForm}
              setShowBlogForm={setShowBlogForm}
            />
          )}

          {tab === 'orders' && <OrdersTab orders={orders} />}

          {tab === 'products' && (
            <ProductsTab showProductForm={showProductForm} setShowProductForm={setShowProductForm} />
          )}

          {tab === 'blogs' && (
            <BlogsTab showBlogForm={showBlogForm} setShowBlogForm={setShowBlogForm} />
          )}
        </div>
      </main>
    </div>
  )
}
