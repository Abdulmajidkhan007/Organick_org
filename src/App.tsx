import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { store } from './Store'
import { Provider } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { setUser } from './slices/authSlice'
import { checkIsAdmin } from './firebase/auth'
import { setDarkMode } from './slices/uiSlice'
import { ErrorBoundary } from './Components/ErrorBoundary'

import { Home } from './Components/Home'
import { About } from './Components/About'
import { Shop } from './Components/Shop'
import { ShopSingle } from './Components/ShopSingle'
import { Service } from './Components/Service'
import { Team } from './Components/Team'
import { Contact } from './Components/Contact'
import { NotFound } from './Components/NotFound'
import { Blog } from './Components/Blog'
import { Portfoilo } from './Components/Portfoilo'
import { PortfoiloSingle } from './Components/PortfoiloSingle'
import { Cart } from './Components/Cart'
import { Checkout } from './Components/Checkout'
import { AuthPage } from './Components/Auth/AuthPage'
import { AdminDashboard } from './Components/Admin/Dashboard'
import { UserDashboard } from './Components/UserDashboard'
import { CartSidebar } from './Components/CartSidebar'

const AppContent = () => {
  useEffect(() => {
    const savedDark = localStorage.getItem('organick_darkMode') === 'true'
    store.dispatch(setDarkMode(savedDark))

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // isAdmin avval ID token claim'idan, u bo'lmasa admins/{uid}
        // hujjatidan keladi (checkIsAdmin). Bu yagona joyda, auth holati
        // o'zgarganda BIR MARTA bajariladi — render'da emas, ya'ni
        // qo'shimcha Firestore o'qishi takrorlanmaydi.
        // Redux'dagi bu qiymat faqat UI uchun — haqiqiy chegara
        // firestore.rules ichida, shuning uchun uni devtools'da
        // o'zgartirish hech narsa bermaydi.
        const isAdmin = await checkIsAdmin(firebaseUser)
        store.dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          isAdmin,
        }))
      } else {
        store.dispatch(setUser(null))
      }
    }, (error) => {
      console.error('[Firebase Auth] onAuthStateChanged error:', error)
      store.dispatch(setUser(null))
    })
    return () => unsubscribe()
  }, [])

  return (
    <>
      <CartSidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ShopSingle />} />
        <Route path="/shopsingle" element={<ShopSingle />} />
        <Route path="/service" element={<Service />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/team" element={<Team />} />
        <Route path="/portfoilo" element={<Portfoilo />} />
        <Route path="/portfoilosingle" element={<PortfoiloSingle />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
