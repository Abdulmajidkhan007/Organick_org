import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'
import { ScrollIndicator } from './ScrollIndicator'
import { useAppDispatch, useAppSelector } from '../hooks'
import { toggleDarkMode, setLanguage, setSearchQuery, clearSearch, toggleMobileMenu, closeMobileMenu } from '../slices/uiSlice'
import { openCart } from '../slices/cartSlice'
import { signOutUser } from '../firebase/auth'
import { logout } from '../slices/authSlice'
import { Language } from '../types'

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: 'uz', label: "O'z", flag: '🇺🇿' },
  { code: 'en', label: 'En', flag: '🇬🇧' },
  { code: 'ru', label: 'Ru', flag: '🇷🇺' },
]

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const darkMode = useAppSelector(s => s.ui.darkMode)
  const searchQuery = useAppSelector(s => s.ui.searchQuery)
  const cartCount = useAppSelector(s => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const user = useAppSelector(s => s.auth.user)
  const isMobileMenuOpen = useAppSelector(s => s.ui.isMobileMenuOpen)
  const products = useAppSelector(s => s.data.products)
  const currentLang = useAppSelector(s => s.ui.language)

  const [showSearch, setShowSearch] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const navLinks = [
    { key: 'nav.home', path: '/home' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.shop', path: '/shop' },
    { key: 'nav.service', path: '/service' },
    { key: 'nav.contact', path: '/contact' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'nav.team', path: '/team' },
    { key: 'nav.portfolio', path: '/portfoilo' },
  ]

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : []

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLang(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLangChange = (lang: Language) => {
    dispatch(setLanguage(lang))
    i18n.changeLanguage(lang)
    setShowLang(false)
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value))
    setShowSearch(true)
  }

  const handleProductClick = (id: number) => {
    dispatch(clearSearch())
    setShowSearch(false)
    navigate(`/shop/${id}`)
  }

  const handleLogout = async () => {
    await signOutUser()
    dispatch(logout())
    setShowUserMenu(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <ScrollIndicator />

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => dispatch(closeMobileMenu())}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2" onClick={() => { navigate('/'); dispatch(closeMobileMenu()) }}>
            <img src={logo} alt="Organick" className="w-8 h-8" />
            <span className="font-bold text-xl text-[#274C5B] dark:text-[#7EB693]">Organick</span>
          </div>
          <button onClick={() => dispatch(closeMobileMenu())} className="text-2xl text-[#274C5B] dark:text-white p-2">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="p-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map(link => (
              <li key={link.path}>
                <button
                  onClick={() => { navigate(link.path); dispatch(closeMobileMenu()) }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors
                    ${isActive(link.path)
                      ? 'bg-[#7EB693] text-white'
                      : 'text-[#274C5B] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {t(link.key)}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 px-4">{user.displayName || user.email}</p>
                {user.isAdmin && (
                  <button onClick={() => { navigate('/admin'); dispatch(closeMobileMenu()) }}
                    className="w-full text-left px-4 py-3 rounded-lg font-semibold text-[#274C5B] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    {t('nav.admin')}
                  </button>
                )}
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button onClick={() => { navigate('/auth'); dispatch(closeMobileMenu()) }}
                className="w-full bg-[#274C5B] text-white py-3 px-4 rounded-lg font-semibold">
                {t('nav.login')}
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Main Navbar */}
      <nav className="navbar w-full bg-white dark:bg-[#0f172a] text-[#274C5B] dark:text-white font-bold
                      flex items-center justify-between px-4 sm:px-8 lg:px-16 sticky top-0 z-10 shadow-lg"
           style={{ height: 'clamp(64px, 10vh, 80px)' }}>

        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6 lg:gap-10 flex-1 min-w-0">
          {/* Hamburger (mobile/tablet) */}
          <button
            className="lg:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => dispatch(toggleMobileMenu())}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <img src={logo} alt="Organick" className="h-10 w-auto" />
            <h1 className="text-xl lg:text-2xl hidden sm:block">Organick</h1>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-3 xl:gap-5 flex-wrap">
            {navLinks.map(link => (
              <li key={link.path} className="hoverEffect1">
                <button
                  onClick={() => navigate(link.path)}
                  className={`text-sm xl:text-base font-semibold transition-colors whitespace-nowrap
                    ${isActive(link.path) ? 'text-[#7EB693]' : 'hover:text-[#7EB693]'}`}
                >
                  {t(link.key)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Search + Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:block">
            <div className="flex items-center h-10 bg-[#F9F8F8] dark:bg-[#1e293b] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => setShowSearch(true)}
                placeholder={t('nav.search')}
                className="w-32 lg:w-48 h-full bg-transparent px-3 text-sm outline-none text-[#274C5B] dark:text-white placeholder-gray-400"
              />
              <button className="w-10 h-10 bg-[#7EB693] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#6aa57e] transition-colors">
                <i className="fas fa-search text-sm"></i>
              </button>
            </div>

            {/* Search Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown fade-in">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <img src={product.img} alt={product.name} className="w-10 h-10 object-contain" />
                    <div>
                      <p className="font-semibold text-sm text-[#274C5B] dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">${product.price}.00</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSearch && searchQuery && searchResults.length === 0 && (
              <div className="search-dropdown fade-in p-4 text-center text-gray-400 text-sm">
                {t('shop.noResults')}
              </div>
            )}
          </div>

          {/* Mobile Search Icon */}
          <button
            className="sm:hidden w-9 h-9 rounded-full bg-[#F9F8F8] dark:bg-[#1e293b] flex items-center justify-center"
            onClick={() => navigate('/shop')}
          >
            <i className="fas fa-search text-sm"></i>
          </button>

          {/* Cart */}
          <button
            onClick={() => dispatch(openCart())}
            className="relative w-9 h-9 rounded-full bg-[#F9F8F8] dark:bg-[#1e293b] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-shopping-cart text-[#274C5B] dark:text-white text-sm"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7EB693] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="w-9 h-9 rounded-full bg-[#F9F8F8] dark:bg-[#1e293b] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-[#274C5B]'} text-sm`}></i>
          </button>

          {/* Language Switcher */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F9F8F8] dark:bg-[#1e293b] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-bold"
            >
              <span>{LANGS.find(l => l.code === currentLang)?.flag}</span>
              <span className="hidden sm:inline text-[#274C5B] dark:text-white">{currentLang.toUpperCase()}</span>
              <i className="fas fa-chevron-down text-xs text-gray-400 ml-1"></i>
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden fade-in min-w-[100px]">
                {LANGS.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${currentLang === lang.code ? 'bg-[#7EB693]/10 text-[#7EB693] font-bold' : 'text-[#274C5B] dark:text-white'}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div ref={userRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden bg-[#7EB693] flex items-center justify-center text-white font-bold text-sm"
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    : <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                  }
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-sm text-[#274C5B] dark:text-white truncate">{user.displayName || user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <button onClick={() => { navigate('/admin'); setShowUserMenu(false) }}
                        className="w-full text-left px-4 py-3 text-sm text-[#274C5B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                        <i className="fas fa-cog"></i> {t('nav.admin')}
                      </button>
                    )}
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <i className="fas fa-sign-out-alt"></i> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="hidden sm:flex items-center gap-2 bg-[#274C5B] dark:bg-[#7EB693] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-user text-xs"></i>
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
