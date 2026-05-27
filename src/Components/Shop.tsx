import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addToCart, openCart } from '../slices/cartSlice'
import { Product } from '../types'
import shopfront from '../assets/shop/shopfront.png'
import shopback from '../assets/shop/shopback.png'

const CATEGORIES = ['All', 'Vegetable', 'Fresh', 'Millets', 'Health', 'Nuts', 'Spicy', 'Fruits']

export const Shop = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const products = useAppSelector(s => s.data.products)
  const searchQuery = useAppSelector(s => s.ui.searchQuery)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default')
  const [addedId, setAddedId] = useState<number | null>(null)

  const filtered = products
    .filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory
      const matchSearch = !localSearch.trim() ||
        p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(localSearch.toLowerCase())
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    dispatch(addToCart(product))
    dispatch(openCart())
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <>
      <Navbar />
      <header className="w-full h-[300px] bg-cover" style={{ backgroundImage: `url(${shopback})` }}>
        <div className="w-full h-full bg-cover Ajustify-center" style={{ backgroundImage: `url(${shopfront})` }}>
          <h1 className="font-bold text-[#274C5B] text-5xl">{t('shop.title')}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full h-12 inpHover pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="inpHover h-12 px-4 sm:w-48"
          >
            <option value="default">Sort by default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors
                ${selectedCategory === cat
                  ? 'bg-[#274C5B] text-white shadow-md'
                  : 'bg-[#F9F8F8] dark:bg-[#1e293b] text-[#274C5B] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {t(`shop.categories.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-gray-400 text-sm mb-6">
          {filtered.length} {filtered.length === 1 ? t('cart.item') : t('cart.items')} found
        </p>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-search text-5xl text-gray-200 mb-4"></i>
            <p className="text-xl font-bold text-gray-400">{t('shop.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/shop/${product.id}`)}
                className="productCard bg-[#F9F8F8] dark:bg-[#1e293b] shadow-md rounded-2xl Ajustify-center-col cursor-pointer overflow-hidden group"
              >
                <div className="productNav w-full flex justify-start items-start p-4">
                  <p className="text-white bg-[#274C5B] dark:bg-[#7EB693] inline px-3 py-1 rounded-lg text-sm">
                    {product.category}
                  </p>
                </div>
                <div className="productImage w-full flex items-center justify-center px-6 pb-2 h-36">
                  <img src={product.img} alt={product.name} className="max-h-full object-contain" />
                </div>
                <div className="productFooter w-full p-4 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-base font-semibold text-[#274C5B] dark:text-white mb-2 truncate">{product.name}</h2>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2 items-center">
                      <span className="line-through text-gray-400 text-sm">${product.oldPrice}.00</span>
                      <span className="text-base font-bold text-[#7EB693]">${product.price}.00</span>
                    </div>
                    <div className="text-yellow-400 text-sm">{'★'.repeat(product.rating)}</div>
                  </div>
                  <button
                    onClick={e => handleAddToCart(e, product)}
                    className={`w-full py-2 rounded-xl text-sm font-bold transition-all
                      ${addedId === product.id
                        ? 'bg-green-500 text-white'
                        : 'bg-[#274C5B] dark:bg-[#7EB693] text-white hover:opacity-90'
                      }`}
                  >
                    <i className={`fas fa-${addedId === product.id ? 'check' : 'shopping-cart'} mr-2`}></i>
                    {addedId === product.id ? 'Added!' : t('shop.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterTop />
      <FooterBottom />
    </>
  )
}
