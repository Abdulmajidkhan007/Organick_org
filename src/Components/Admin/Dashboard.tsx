import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { addProduct, updateProduct, deleteProduct, addBlog, updateBlog, deleteBlog } from '../../Data'
import { Product, BlogPost } from '../../types'

type AdminTab = 'dashboard' | 'products' | 'blogs'

const emptyProduct: Omit<Product, 'id'> = {
  category: 'Vegetable',
  img: '',
  name: '',
  oldPrice: 0,
  price: 0,
  rating: 5,
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

  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [newBlog, setNewBlog] = useState<Omit<BlogPost, 'id'>>(emptyBlog)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <i className="fas fa-lock text-5xl text-gray-300 mb-4"></i>
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
          <i className="fas fa-user-slash text-5xl text-red-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-2">{t('admin.accessDenied')}</h2>
          <p className="text-gray-500 mb-2">{t('admin.notAdmin')}</p>
          <p className="text-gray-400 text-sm mb-6">Logged in as: {user.email}</p>
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

  const navItems = [
    { key: 'dashboard' as AdminTab, icon: 'fa-chart-line', label: t('admin.dashboard') },
    { key: 'products' as AdminTab, icon: 'fa-box', label: t('admin.products') },
    { key: 'blogs' as AdminTab, icon: 'fa-newspaper', label: t('admin.blogs') },
  ]

  const categories = ['Vegetable', 'Fresh', 'Millets', 'Health', 'Nuts', 'Spicy', 'Fruits', 'Nuts & Seeds']

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f172a]">
      {/* Sidebar */}
      <aside className={`admin-sidebar flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && <span className="font-bold text-lg">Organick Admin</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <i className={`fas fa-${sidebarOpen ? 'chevron-left' : 'chevron-right'} text-sm`}></i>
          </button>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-semibold text-sm
                ${tab === item.key ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <i className={`fas ${item.icon} text-base w-5 flex-shrink-0 text-center`}></i>
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
        </nav>
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.displayName || user.email}</p>
                <p className="text-xs text-white/60">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#274C5B] dark:text-white mb-6">{t('admin.title')}</h1>

          {/* Dashboard Tab */}
          {tab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#274C5B]/10 rounded-xl flex items-center justify-center">
                    <i className="fas fa-box text-[#274C5B] text-xl"></i>
                  </div>
                  <span className="text-3xl font-bold text-[#274C5B] dark:text-white">{products.length}</span>
                </div>
                <h3 className="font-semibold text-gray-500 dark:text-gray-400">{t('admin.totalProducts')}</h3>
                <button onClick={() => setTab('products')} className="text-sm text-[#7EB693] hover:underline mt-2 font-semibold">
                  {t('admin.products')} →
                </button>
              </div>
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#7EB693]/10 rounded-xl flex items-center justify-center">
                    <i className="fas fa-newspaper text-[#7EB693] text-xl"></i>
                  </div>
                  <span className="text-3xl font-bold text-[#274C5B] dark:text-white">{blogs.length}</span>
                </div>
                <h3 className="font-semibold text-gray-500 dark:text-gray-400">{t('admin.totalBlogs')}</h3>
                <button onClick={() => setTab('blogs')} className="text-sm text-[#7EB693] hover:underline mt-2 font-semibold">
                  {t('admin.blogs')} →
                </button>
              </div>
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-star text-amber-500 text-xl"></i>
                  </div>
                  <span className="text-3xl font-bold text-[#274C5B] dark:text-white">5.0</span>
                </div>
                <h3 className="font-semibold text-gray-500 dark:text-gray-400">Avg. Rating</h3>
              </div>

              {/* Quick Actions */}
              <div className="col-span-full bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-[#274C5B] dark:text-white mb-4 text-lg">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => { setTab('products'); setShowProductForm(true) }}
                    className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
                    <i className="fas fa-plus"></i> {t('admin.addProduct')}
                  </button>
                  <button onClick={() => { setTab('blogs'); setShowBlogForm(true) }}
                    className="flex items-center gap-2 bg-[#7EB693] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
                    <i className="fas fa-plus"></i> {t('admin.addBlog')}
                  </button>
                  <button onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-[#274C5B] dark:text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                    <i className="fas fa-store"></i> {t('nav.shop')}
                  </button>
                </div>
              </div>
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

              {/* Product Form */}
              {showProductForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm mb-6 fade-in">
                  <h3 className="font-bold text-[#274C5B] dark:text-white mb-4">
                    {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productName')}</label>
                      <input
                        type="text" value={newProduct.name}
                        onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                        className="w-full inpHover h-10"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productCategory')}</label>
                      <select
                        value={newProduct.category}
                        onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                        className="w-full inpHover h-10"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productPrice')}</label>
                      <input
                        type="number" value={newProduct.price}
                        onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full inpHover h-10"
                        min="0" step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productOldPrice')}</label>
                      <input
                        type="number" value={newProduct.oldPrice}
                        onChange={e => setNewProduct(p => ({ ...p, oldPrice: Number(e.target.value) }))}
                        className="w-full inpHover h-10"
                        min="0" step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productImage')}</label>
                      <input
                        type="text" value={newProduct.img}
                        onChange={e => setNewProduct(p => ({ ...p, img: e.target.value }))}
                        className="w-full inpHover h-10"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productDesc')}</label>
                      <textarea
                        value={newProduct.description || ''}
                        onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                        className="w-full inpHover"
                        rows={3}
                        placeholder="Product description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productRating')}</label>
                      <select
                        value={newProduct.rating}
                        onChange={e => setNewProduct(p => ({ ...p, rating: Number(e.target.value) }))}
                        className="w-full inpHover h-10"
                      >
                        {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} ★</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveProduct}
                      className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">
                      {t('admin.save')}
                    </button>
                    <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
                      className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {t('admin.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">#</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">Image</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.name')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.category')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.price')}</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3">
                            <img src={p.img} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
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
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditProduct(p)}
                                className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <i className="fas fa-edit"></i>
                              </button>
                              {deleteConfirm === p.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteProduct(p.id)}
                                    className="text-white bg-red-500 text-xs px-2 py-1 rounded-lg hover:bg-red-600">
                                    {t('admin.yes')}
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="text-gray-500 border border-gray-300 text-xs px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {t('admin.no')}
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(p.id)}
                                  className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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

              {/* Blog Form */}
              {showBlogForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm mb-6 fade-in">
                  <h3 className="font-bold text-[#274C5B] dark:text-white mb-4">
                    {editingBlog ? t('admin.editBlog') : t('admin.addBlog')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogTitle')}</label>
                      <input
                        type="text" value={newBlog.title}
                        onChange={e => setNewBlog(b => ({ ...b, title: e.target.value }))}
                        className="w-full inpHover h-10"
                        placeholder="Blog title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogAuthor')}</label>
                      <input
                        type="text" value={newBlog.user}
                        onChange={e => setNewBlog(b => ({ ...b, user: e.target.value }))}
                        className="w-full inpHover h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogDate')}</label>
                      <input
                        type="text" value={newBlog.date}
                        onChange={e => setNewBlog(b => ({ ...b, date: e.target.value }))}
                        className="w-full inpHover h-10"
                        placeholder="25 Nov"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogImage')}</label>
                      <input
                        type="text" value={newBlog.img}
                        onChange={e => setNewBlog(b => ({ ...b, img: e.target.value }))}
                        className="w-full inpHover h-10"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogContent')}</label>
                      <textarea
                        value={newBlog.content || ''}
                        onChange={e => setNewBlog(b => ({ ...b, description: e.target.value.slice(0, 100), content: e.target.value }))}
                        className="w-full inpHover"
                        rows={5}
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveBlog}
                      className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">
                      {t('admin.save')}
                    </button>
                    <button onClick={() => { setShowBlogForm(false); setEditingBlog(null) }}
                      className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {t('admin.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Blog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map(b => (
                  <div key={b.id} className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {b.img && (
                      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${b.img})` }} />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-[#7EB693]/10 text-[#7EB693] px-2 py-1 rounded-lg">{b.date}</span>
                        <span className="text-xs text-gray-400">{b.user}</span>
                      </div>
                      <h4 className="font-bold text-[#274C5B] dark:text-white text-sm mb-3 line-clamp-2">{b.title}</h4>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditBlog(b)}
                          className="flex-1 text-center text-sm text-blue-500 hover:text-blue-700 border border-blue-200 dark:border-blue-800 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <i className="fas fa-edit mr-1"></i>{t('admin.edit')}
                        </button>
                        {deleteBlogConfirm === b.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteBlog(b.id)}
                              className="text-white bg-red-500 text-xs px-2 py-1 rounded-lg">{t('admin.yes')}</button>
                            <button onClick={() => setDeleteBlogConfirm(null)}
                              className="text-gray-500 border text-xs px-2 py-1 rounded-lg">{t('admin.no')}</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteBlogConfirm(b.id)}
                            className="text-red-400 hover:text-red-600 border border-red-200 dark:border-red-800 py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
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
