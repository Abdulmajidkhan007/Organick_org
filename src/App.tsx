import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { store } from './Store'
import { Provider } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { setUser } from './slices/authSlice'
import { ADMIN_EMAILS } from './firebase/auth'
import { setDarkMode } from './slices/uiSlice'

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
import { AuthPage } from './Components/Auth/AuthPage'
import { AdminDashboard } from './Components/Admin/Dashboard'
import { CartSidebar } from './Components/CartSidebar'

const AppContent = () => {
  useEffect(() => {
    const savedDark = localStorage.getItem('organick_darkMode') === 'true'
    store.dispatch(setDarkMode(savedDark))

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        store.dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || ''),
        }))
      } else {
        store.dispatch(setUser(null))
      }
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
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export const App = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </BrowserRouter>
  )
}
