import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { addProduct, updateProduct, deleteProduct } from '../../Data'
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  seedCatalogToFirestore,
} from '../../firebase/catalog'
import { Product } from '../../types'
import { ImageUploadField } from './ImageUploadField'

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

const categories = ['Vegetable', 'Fresh', 'Millets', 'Health', 'Nuts', 'Spicy', 'Fruits', 'Nuts & Seeds']

interface ProductsTabProps {
  showProductForm: boolean
  setShowProductForm: (v: boolean) => void
}

// Bir martalik ko'chirish tugmasining holati.
type SeedState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; products: number; blogs: number }
  | { kind: 'notEmpty' }
  | { kind: 'error' }

export const ProductsTab = ({ showProductForm, setShowProductForm }: ProductsTabProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const products = useAppSelector(s => s.data.products)
  const blogs = useAppSelector(s => s.data.blogs)
  const user = useAppSelector(s => s.auth.user)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  // Xato JIM YUTILMAYDI: Firestore yozuvi bajarilmasa admin buni
  // ko'rishi shart, aks holda u o'zgarish saqlandi deb o'ylaydi.
  const [error, setError] = useState<string | null>(null)
  const [seed, setSeed] = useState<SeedState>({ kind: 'idle' })

  // TARTIB MUHIM: avval Firestore, keyin Redux. Teskarisi bo'lsa yozuv
  // yiqilganda ekranda "saqlandi" holat qolib, haqiqat bilan
  // farq qilib ketardi.
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0)
    const product: Product = editingProduct
      ? { ...newProduct, id: editingProduct.id }
      : { ...newProduct, id: maxId + 1 }

    setSaving(true)
    setError(null)
    try {
      await saveProductToFirestore(product)
    } catch (e) {
      console.error('[Admin] mahsulotni saqlab bo\'lmadi:', e)
      setError(t('admin.writeError'))
      setSaving(false)
      return
    }
    setSaving(false)

    dispatch(editingProduct ? updateProduct(product) : addProduct(product))
    setShowProductForm(false)
    setEditingProduct(null)
    setNewProduct(emptyProduct)
  }

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p)
    setNewProduct({ ...p })
    setError(null)
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: number) => {
    setError(null)
    try {
      await deleteProductFromFirestore(id)
    } catch (e) {
      console.error('[Admin] mahsulotni o\'chirib bo\'lmadi:', e)
      setError(t('admin.writeError'))
      setDeleteConfirm(null)
      return
    }
    dispatch(deleteProduct(id))
    setDeleteConfirm(null)
  }

  /**
   * Bir martalik ko'chirish. `seedCatalogToFirestore` ikkala
   * kolleksiya ham BO'SH bo'lgandagina yozadi — to'la bo'lsa
   * `written: false` qaytaradi va biz ogohlantiramiz.
   */
  const handleSeed = async () => {
    setSeed({ kind: 'running' })
    try {
      const res = await seedCatalogToFirestore(products, blogs)
      setSeed(res.written
        ? { kind: 'done', products: res.products, blogs: res.blogs }
        : { kind: 'notEmpty' })
    } catch (e) {
      console.error('[Admin] katalogni ko\'chirib bo\'lmadi:', e)
      setSeed({ kind: 'error' })
    }
  }

  return (
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

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <i className="fas fa-triangle-exclamation mr-2"></i>{error}
        </div>
      )}

      {/* BIR MARTALIK KO'CHIRISH — faqat admin ko'radi. `/admin` route'i
          allaqachon admin bilan chegaralangan (Dashboard.tsx), bu shart
          ikkinchi qavat: panel hech qachon oddiy foydalanuvchiga
          chizilmasin. */}
      {user?.isAdmin && (
        <div className="mb-6 rounded-2xl border border-[#7EB693]/40 bg-[#7EB693]/5 p-4">
          <button
            onClick={handleSeed}
            disabled={seed.kind === 'running'}
            className="bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60"
          >
            <i className="fas fa-database mr-2"></i>
            {seed.kind === 'running' ? t('admin.seedRunning') : t('admin.seedRun')}
          </button>
          {seed.kind === 'done' && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">
              <i className="fas fa-circle-check mr-2"></i>
              {t('admin.seedDone', { products: seed.products, blogs: seed.blogs })}
            </p>
          )}
          {seed.kind === 'notEmpty' && (
            <p className="mt-3 text-sm text-yellow-700 dark:text-yellow-400">
              <i className="fas fa-triangle-exclamation mr-2"></i>{t('admin.seedNotEmpty')}
            </p>
          )}
          {seed.kind === 'error' && (
            <p className="mt-3 text-sm text-red-700 dark:text-red-300">
              <i className="fas fa-circle-xmark mr-2"></i>{t('admin.writeError')}
            </p>
          )}
        </div>
      )}

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
            <ImageUploadField
              label={t('admin.productImage')}
              value={newProduct.img}
              onChange={url => setNewProduct(p => ({ ...p, img: url }))}
              kind="product"
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.productDesc')}</label>
              <textarea value={newProduct.description || ''}
                onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                className="w-full inpHover" rows={3} placeholder="Product description..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveProduct} disabled={saving}
              className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? t('admin.saving') : t('admin.save')}
            </button>
            <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
              className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300">{t('admin.cancel')}</button>
          </div>
        </div>
      )}

      {/* Mobile: card list (md dan kichik ekranlar) */}
      <div className="md:hidden flex flex-col gap-3">
        {products.map((p, i) => (
          <div key={p.id} className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm p-4">
            <div className="flex items-start gap-3">
              <img
                src={p.img}
                alt={p.name}
                className="w-14 h-14 object-contain rounded-lg bg-gray-50 shrink-0"
                width={56}
                height={56}
                decoding="async"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#274C5B] dark:text-white text-sm truncate">{p.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
                </div>
                <span className="inline-block mt-1 bg-[#274C5B]/10 text-[#274C5B] dark:text-[#7EB693] text-xs px-2 py-1 rounded-lg">{p.category}</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-[#7EB693]">${p.price}</span>
                  {p.oldPrice > p.price && <span className="line-through text-gray-400 text-xs">${p.oldPrice}</span>}
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stock')}: </span>
                  <span className={`text-sm font-semibold ${(p.stock ?? 0) > 10 ? 'text-green-600' : (p.stock ?? 0) > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {p.stock ?? 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => handleEditProduct(p)}
                aria-label={t('admin.edit')}
                className="flex items-center justify-center w-11 h-11 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <i className="fas fa-edit"></i>
              </button>
              {deleteConfirm === p.id ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDeleteProduct(p.id)}
                    className="text-white bg-red-500 text-sm px-4 min-h-[44px] rounded-lg">{t('admin.yes')}</button>
                  <button onClick={() => setDeleteConfirm(null)}
                    className="text-gray-500 border text-sm px-4 min-h-[44px] rounded-lg">{t('admin.no')}</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(p.id)}
                  aria-label={t('admin.deleteProduct')}
                  className="flex items-center justify-center w-11 h-11 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet: jadval (md va undan katta) */}
      <div className="hidden md:block bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">#</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.image')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.name')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.category')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.price')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin.stock')}</th>
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
                        aria-label={t('admin.edit')}
                        className="flex items-center justify-center w-11 h-11 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                          aria-label={t('admin.deleteProduct')}
                          className="flex items-center justify-center w-11 h-11 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
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
  )
}
