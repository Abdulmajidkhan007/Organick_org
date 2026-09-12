import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { addProduct, updateProduct, deleteProduct, addBlog, updateBlog, deleteBlog } from '../../Data'
import { sendTelegram } from '../../utils/telegram'
import { subscribeAllOrders, updateOrderInFirestore } from '../../firebase/firestore'
import { Product, BlogPost, Order, OrderStatus } from '../../types'
import { getStatusStyle } from '../Checkout'

type AdminTab = 'dashboard' | 'products' | 'blogs' | 'orders'

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: '🕐 Kutilmoqda' },
  { value: 'confirmed',  label: '✅ Tasdiqlandi' },
  { value: 'processing', label: '⚙️ Tayyorlanmoqda' },
  { value: 'shipped',    label: '🚚 Yuborildi' },
  { value: 'delivered',  label: '📦 Yetkazildi' },
  { value: 'cancelled',  label: '❌ Bekor qilindi' },
]

const emptyProduct: Omit<Product, 'id'> = {
  category: 'Vegetable',
  img: '',
  name: '',
  oldPrice: 0,
  price: 0,
  rating: 5,
  stock: 50,
  description: '',
}

const emptyBlog: Omit<BlogPost, 'id'> = {
  date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
  img: '',
  user: 'By Admin',
  title: '',
  description: '',
  content: '',
}

export const AdminDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const products = useAppSelector(s => s.data.products)
  const blogs = useAppSelector(s => s.data.blogs)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const unsub = subscribeAllOrders(setOrders)
    return unsub
  }, [])

  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [newBlog, setNewBlog] = useState<Omit<BlogPost, 'id'>>(emptyBlog)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [replyNote, setReplyNote] = useState('')
  const [replyStatus, setReplyStatus] = useState<OrderStatus>('confirmed')
  const [sendingReply, setSendingReply] = useState(false)
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all')

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

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price) return
    if (editingProduct) {
      dispatch(updateProduct({ ...newProduct, id: editingProduct.id }))
    } else {
      const maxId = products.reduce((max, p) => Math.max(max, p.id), 0)
      dispatch(addProduct({ ...newProduct, id: maxId + 1 }))
    }
    setShowProductForm(false)
    setEditingProduct(null)
    setNewProduct(emptyProduct)
  }

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p)
    setNewProduct({ ...p })
    setShowProductForm(true)
  }

  const handleDeleteProduct = (id: number) => {
    dispatch(deleteProduct(id))
    setDeleteConfirm(null)
  }

  const handleSaveBlog = () => {
    if (!newBlog.title) return
    if (editingBlog) {
      dispatch(updateBlog({ ...newBlog, id: editingBlog.id }))
    } else {
      const maxId = blogs.reduce((max, b) => Math.max(max, b.id), 0)
      dispatch(addBlog({ ...newBlog, id: maxId + 1 }))
    }
    setShowBlogForm(false)
    setEditingBlog(null)
    setNewBlog(emptyBlog)
  }

  const handleEditBlog = (b: BlogPost) => {
    setEditingBlog(b)
    setNewBlog({ ...b })
    setShowBlogForm(true)
  }

  const handleDeleteBlog = (id: number) => {
    dispatch(deleteBlog(id))
    setDeleteBlogConfirm(null)
  }

  const handleSendReply = async (order: Order) => {
    if (!replyNote.trim()) return
    setSendingReply(true)
    await updateOrderInFirestore(order.id, replyStatus, replyNote)

    const st = ORDER_STATUS_OPTIONS.find(s => s.value === replyStatus)
    const text = [
      `↩️ <b>BUYURTMA #${order.id} YANGILANISHI</b>`,
      '',
      `${st?.label || replyStatus}`,
      `📝 Admin xabari: ${replyNote}`,
      '',
      `👤 Mijoz: ${order.customerName}`,
      order.customerTelegram ? `💬 Telegram: ${order.customerTelegram}` : '',
    ].filter(Boolean).join('\n')

    await sendTelegram(text, import.meta.env.VITE_TELEGRAM_THREAD_ID_ORDERS)
    setSendingReply(false)
    setReplyNote('')
    setSelectedOrder(null)
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)
  const categories = ['Vegetable', 'Fresh', 'Millets', 'Health', 'Nuts', 'Spicy', 'Fruits', 'Nuts & Seeds']

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

          {/* Dashboard Tab */}
          {tab === 'dashboard' && (
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
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.orders')} ({orders.length})</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={orderFilter}
                    onChange={e => setOrderFilter(e.target.value as OrderStatus | 'all')}
                    className="inpHover h-10 text-sm pr-8"
                  >
                    <option value="all">Barchasi ({orders.length})</option>
                    {ORDER_STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label} ({orders.filter(o => o.status === s.value).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-16 text-center shadow-sm">
                  <i className="fas fa-shopping-bag text-4xl text-gray-200 mb-4 block"></i>
                  <p className="text-gray-400">{t('admin.noOrders')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map(order => {
                    const st = getStatusStyle(order.status)
                    return (
                      <div key={order.id} className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
                        {/* Order Header */}
                        <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-[#274C5B] dark:text-white">{order.id}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                              {order.status === 'pending' && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">🔴 Yangi</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                              <span>{order.customerName}</span>
                              <span>•</span>
                              <a href={`tel:${order.customerPhone}`} className="text-[#274C5B] dark:text-[#7EB693] hover:underline font-semibold">
                                <i className="fas fa-phone text-xs mr-1"></i>{order.customerPhone}
                              </a>
                              {order.customerTelegram && (
                                <>
                                  <span>•</span>
                                  <a href={`https://t.me/${order.customerTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                                    className="text-[#2AABEE] hover:underline font-semibold">
                                    <i className="fab fa-telegram text-xs mr-1"></i>{order.customerTelegram}
                                  </a>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-xl text-[#7EB693]">${order.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{order.items.length} mahsulot</p>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="px-5 py-3 flex items-center gap-3 overflow-x-auto">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex-shrink-0 flex items-center gap-2 bg-[#F9F8F8] dark:bg-gray-800 rounded-xl px-3 py-2">
                              <img
                                src={item.productImg}
                                alt=""
                                className="w-8 h-8 object-contain"
                                width={32}
                                height={32}
                                decoding="async"
                                loading="lazy"
                              />
                              <div>
                                <p className="text-xs font-semibold text-[#274C5B] dark:text-white whitespace-nowrap">{item.productName}</p>
                                <p className="text-xs text-gray-400">x{item.quantity} — ${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Address */}
                        <div className="px-5 pb-3">
                          <p className="text-sm text-gray-500"><i className="fas fa-map-marker-alt mr-1 text-[#7EB693]"></i>{order.customerAddress}</p>
                        </div>

                        {/* Admin Note */}
                        {order.adminNote && (
                          <div className="mx-5 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1"><i className="fas fa-comment-alt mr-1"></i>Admin xabari:</p>
                            <p className="text-sm text-blue-600 dark:text-blue-300">{order.adminNote}</p>
                          </div>
                        )}

                        {/* Reply Form */}
                        {selectedOrder?.id === order.id ? (
                          <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-sm text-[#274C5B] dark:text-white">Xabar yuborish</h4>
                              {order.customerTelegram && (
                                <a
                                  href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 bg-[#2AABEE] text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:opacity-90"
                                >
                                  <i className="fab fa-telegram"></i> {order.customerTelegram}
                                </a>
                              )}
                            </div>
                            <select
                              value={replyStatus}
                              onChange={e => setReplyStatus(e.target.value as OrderStatus)}
                              className="inpHover h-10 text-sm w-full mb-3"
                            >
                              {ORDER_STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <textarea
                              rows={3}
                              value={replyNote}
                              onChange={e => setReplyNote(e.target.value)}
                              className="inpHover w-full mb-3"
                              placeholder="Mijozga xabar yozing..."
                            />
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleSendReply(order)}
                                disabled={sendingReply || !replyNote.trim()}
                                className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                              >
                                {sendingReply ? <><i className="fas fa-spinner fa-spin"></i> Yuborilmoqda...</> : <><i className="fab fa-telegram"></i> Saqlash + Telegram</>}
                              </button>
                              <button onClick={() => setSelectedOrder(null)}
                                className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                Bekor
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 pb-4 flex gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setReplyNote(order.adminNote || '')
                                setReplyStatus(order.status)
                              }}
                              className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                            >
                              <i className="fas fa-reply"></i> Javob berish
                            </button>
                            {order.customerTelegram && (
                              <a
                                href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#2AABEE] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                              >
                                <i className="fab fa-telegram"></i> Telegramda yozing
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.products')} ({products.length})</h2>
                <button
                  onClick={() => { setShowProductForm(!showProductForm); setEditingProduct(null); setNewProduct(emptyProduct) }}
                  className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm"
                >
                  <i className={`fas fa-${showProductForm ? 'times' : 'plus'}`}></i>
                  {showProductForm ? t('admin.cancel') : t('admin.addProduct')}
                </button>
              </div>

              {showProductForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm mb-6 fade-in">
                  <h3 className="font-bold text-[#274C5B] dark:text-white mb-4">
                    {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productName')}</label>
                      <input type="text" value={newProduct.name}
                        onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                        className="w-full inpHover h-10" placeholder="Product name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productCategory')}</label>
                      <select value={newProduct.category}
                        onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                        className="w-full inpHover h-10">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productPrice')}</label>
                      <input type="number" value={newProduct.price}
                        onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full inpHover h-10" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productOldPrice')}</label>
                      <input type="number" value={newProduct.oldPrice}
                        onChange={e => setNewProduct(p => ({ ...p, oldPrice: Number(e.target.value) }))}
                        className="w-full inpHover h-10" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productStock')}</label>
                      <input type="number" value={newProduct.stock ?? 50}
                        onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))}
                        className="w-full inpHover h-10" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productRating')}</label>
                      <select value={newProduct.rating}
                        onChange={e => setNewProduct(p => ({ ...p, rating: Number(e.target.value) }))}
                        className="w-full inpHover h-10">
                        {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} ★</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productImage')}</label>
                      <input type="text" value={newProduct.img}
                        onChange={e => setNewProduct(p => ({ ...p, img: e.target.value }))}
                        className="w-full inpHover h-10" placeholder="https://example.com/image.jpg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productDesc')}</label>
                      <textarea value={newProduct.description || ''}
                        onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                        className="w-full inpHover" rows={3} placeholder="Product description..." />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveProduct}
                      className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">{t('admin.save')}</button>
                    <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
                      className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300">{t('admin.cancel')}</button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">#</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">Rasm</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.name')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.category')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.price')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">Stock</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3">
                            <img
                              src={p.img}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-lg bg-gray-50"
                              width={40}
                              height={40}
                              decoding="async"
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#274C5B] dark:text-white text-sm">{p.name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-[#274C5B]/10 text-[#274C5B] dark:text-[#7EB693] text-xs px-2 py-1 rounded-lg">{p.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#7EB693]">${p.price}</span>
                              {p.oldPrice > p.price && <span className="line-through text-gray-400 text-xs">${p.oldPrice}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${(p.stock ?? 0) > 10 ? 'text-green-600' : (p.stock ?? 0) > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {p.stock ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditProduct(p)}
                                className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <i className="fas fa-edit"></i>
                              </button>
                              {deleteConfirm === p.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteProduct(p.id)}
                                    className="text-white bg-red-500 text-xs px-2 py-1 rounded-lg">{t('admin.yes')}</button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="text-gray-500 border text-xs px-2 py-1 rounded-lg">{t('admin.no')}</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(p.id)}
                                  className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Blogs Tab */}
          {tab === 'blogs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.blogs')} ({blogs.length})</h2>
                <button
                  onClick={() => { setShowBlogForm(!showBlogForm); setEditingBlog(null); setNewBlog(emptyBlog) }}
                  className="flex items-center gap-2 bg-[#7EB693] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm"
                >
                  <i className={`fas fa-${showBlogForm ? 'times' : 'plus'}`}></i>
                  {showBlogForm ? t('admin.cancel') : t('admin.addBlog')}
                </button>
              </div>

              {showBlogForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm mb-6 fade-in">
                  <h3 className="font-bold text-[#274C5B] dark:text-white mb-4">
                    {editingBlog ? t('admin.editBlog') : t('admin.addBlog')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogTitle')}</label>
                      <input type="text" value={newBlog.title}
                        onChange={e => setNewBlog(b => ({ ...b, title: e.target.value }))}
                        className="w-full inpHover h-10" placeholder="Blog title..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogAuthor')}</label>
                      <input type="text" value={newBlog.user}
                        onChange={e => setNewBlog(b => ({ ...b, user: e.target.value }))}
                        className="w-full inpHover h-10" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogDate')}</label>
                      <input type="text" value={newBlog.date}
                        onChange={e => setNewBlog(b => ({ ...b, date: e.target.value }))}
                        className="w-full inpHover h-10" placeholder="25 Nov" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogImage')}</label>
                      <input type="text" value={newBlog.img}
                        onChange={e => setNewBlog(b => ({ ...b, img: e.target.value }))}
                        className="w-full inpHover h-10" placeholder="https://example.com/image.jpg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogContent')}</label>
                      <textarea
                        value={newBlog.content || ''}
                        onChange={e => setNewBlog(b => ({ ...b, description: e.target.value.slice(0, 100), content: e.target.value }))}
                        className="w-full inpHover" rows={5} placeholder="Write your blog post content here..." />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveBlog}
                      className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">{t('admin.save')}</button>
                    <button onClick={() => { setShowBlogForm(false); setEditingBlog(null) }}
                      className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300">{t('admin.cancel')}</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map(b => (
                  <div key={b.id} className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {b.img && <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${b.img})` }} />}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-[#7EB693]/10 text-[#7EB693] px-2 py-1 rounded-lg">{b.date}</span>
                        <span className="text-xs text-gray-400">{b.user}</span>
                      </div>
                      <h4 className="font-bold text-[#274C5B] dark:text-white text-sm mb-3 line-clamp-2">{b.title}</h4>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditBlog(b)}
                          className="flex-1 text-center text-sm text-blue-500 hover:text-blue-700 border border-blue-200 dark:border-blue-800 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <i className="fas fa-edit mr-1"></i>{t('admin.edit')}
                        </button>
                        {deleteBlogConfirm === b.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteBlog(b.id)} className="text-white bg-red-500 text-xs px-2 py-1 rounded-lg">{t('admin.yes')}</button>
                            <button onClick={() => setDeleteBlogConfirm(null)} className="text-gray-500 border text-xs px-2 py-1 rounded-lg">{t('admin.no')}</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteBlogConfirm(b.id)}
                            className="text-red-400 hover:text-red-600 border border-red-200 dark:border-red-800 py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
