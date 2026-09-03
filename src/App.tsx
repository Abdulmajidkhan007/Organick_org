import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { store } from './Store'
import { Provider } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { setUser } from './slices/authSlice'
import { checkIsAdmin } from './firebase/auth'
import { setDarkMode } from './slices/uiSlice'
import { ErrorBoundary } from './Components/ErrorBoundary'
import { RouteLoader } from './Components/RouteLoader'

// Bosh sahifa — birinchi ko'riladigan ekran, shuning uchun STATIK:
// uni lazy qilish faqat ortiqcha "spinner sakrashi" beradi.
import { Home } from './Components/Home'
// CartSidebar har sahifada (route'dan tashqarida) turadi — u ham statik.
import { CartSidebar } from './Components/CartSidebar'

// Qolgan barcha sahifalar alohida chunk sifatida, faqat kerak bo'lganda
// yuklanadi. Eng muhimi — /checkout, /auth, /dashboard va /admin: aynan
// shu to'rttasi Firestore SDK (+ re2js) ni olib keladi, ular lazy bo'lgani
// uchun bosh sahifa u chunk'ni UMUMAN so'ramaydi.
//
// Komponentlar `export const` (named) bo'lgani uchun `React.lazy` uchun
// `default` ga o'girib beramiz.
const About           = lazy(() => import('./Components/About').then(m => ({ default: m.About })))
const Shop            = lazy(() => import('./Components/Shop').then(m => ({ default: m.Shop })))
const ShopSingle      = lazy(() => import('./Components/ShopSingle').then(m => ({ default: m.ShopSingle })))
const Service         = lazy(() => import('./Components/Service').then(m => ({ default: m.Service })))
const Team            = lazy(() => import('./Components/Team').then(m => ({ default: m.Team })))
const Contact         = lazy(() => import('./Components/Contact').then(m => ({ default: m.Contact })))
const Blog            = lazy(() => import('./Components/Blog').then(m => ({ default: m.Blog })))
const Portfoilo       = lazy(() => import('./Components/Portfoilo').then(m => ({ default: m.Portfoilo })))
const PortfoiloSingle = lazy(() => import('./Components/PortfoiloSingle').then(m => ({ default: m.PortfoiloSingle })))
const Cart            = lazy(() => import('./Components/Cart').then(m => ({ default: m.Cart })))
const NotFound        = lazy(() => import('./Components/NotFound').then(m => ({ default: m.NotFound })))

// Firestore/Auth og'irligini olib keladigan to'rtlik:
const Checkout        = lazy(() => import('./Components/Checkout').then(m => ({ default: m.Checkout })))
const AuthPage        = lazy(() => import('./Components/Auth/AuthPage').then(m => ({ default: m.AuthPage })))
const UserDashboard   = lazy(() => import('./Components/UserDashboard').then(m => ({ default: m.UserDashboard })))
const AdminDashboard  = lazy(() => import('./Components/Admin/Dashboard').then(m => ({ default: m.AdminDashboard })))

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
      {/* Suspense <Routes> ni O'RAB turadi (ichida emas): shunda bitta
          fallback barcha lazy route'larga xizmat qiladi va route
          almashinuvida bir zumga bo'sh ekran ko'rinmaydi. */}
      <Suspense fallback={<RouteLoader />}>
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
      </Suspense>
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
