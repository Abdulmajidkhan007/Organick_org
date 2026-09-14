import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../hooks'
import { getStatusStyle } from '../Checkout'
import { Order } from '../../types'
import { AdminTab } from './Dashboard'

interface StatsTabProps {
  orders: Order[]
  pendingCount: number
  setTab: (tab: AdminTab) => void
  setShowProductForm: (v: boolean) => void
  setShowBlogForm: (v: boolean) => void
}

export const StatsTab = ({ orders, pendingCount, setTab, setShowProductForm, setShowBlogForm }: StatsTabProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const products = useAppSelector(s => s.data.products)
  const blogs = useAppSelector(s => s.data.blogs)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: t('admin.totalProducts'), value: products.length, icon: 'fa-box', color: 'bg-[#274C5B]/10', iconColor: 'text-[#274C5B]' },
        { label: t('admin.totalBlogs'), value: blogs.length, icon: 'fa-newspaper', color: 'bg-[#7EB693]/10', iconColor: 'text-[#7EB693]' },
        { label: t('admin.totalOrders'), value: orders.length, icon: 'fa-shopping-bag', color: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: t('admin.pendingOrders'), value: pendingCount, icon: 'fa-clock', color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      ].map((card, i) => (
        <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
              <i className={`fas ${card.icon} ${card.iconColor} text-xl`}></i>
            </div>
            <span className="text-3xl font-bold text-[#274C5B] dark:text-white">{card.value}</span>
          </div>
          <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm">{card.label}</h3>
        </div>
      ))}

      <div className="col-span-full bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#274C5B] dark:text-white mb-4 text-lg">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setTab('orders')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm">
            <i className="fas fa-shopping-bag"></i> {t('admin.orders')}
            {pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>
          <button onClick={() => { setTab('products'); setShowProductForm(true) }}
            className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm">
            <i className="fas fa-plus"></i> {t('admin.addProduct')}
          </button>
          <button onClick={() => { setTab('blogs'); setShowBlogForm(true) }}
            className="flex items-center gap-2 bg-[#7EB693] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm">
            <i className="fas fa-plus"></i> {t('admin.addBlog')}
          </button>
          <button onClick={() => navigate('/shop')}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-[#274C5B] dark:text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <i className="fas fa-store"></i> {t('nav.shop')}
          </button>
        </div>
      </div>

      {/* Recent Orders Preview */}
      {orders.slice(0, 3).length > 0 && (
        <div className="col-span-full bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#274C5B] dark:text-white text-lg">{t('admin.recentOrders')}</h3>
            <button onClick={() => setTab('orders')} className="text-sm text-[#7EB693] hover:underline font-semibold">{t('admin.viewAll')} →</button>
          </div>
          {orders.slice(0, 3).map(order => {
            const st = getStatusStyle(order.status)
            return (
              <div key={order.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#274C5B] dark:text-white">{order.id}</p>
                  <p className="text-xs text-gray-400">{order.customerName} • {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                <span className="font-bold text-[#7EB693] text-sm">${order.total.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
