import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './Fonts.css'
// FontAwesome loaded via CDN in index.html (v6.7.2 - compatible with fas/far/fab classes)
// import '@fortawesome/fontawesome-free/css/all.min.css'
import './i18n/index'
import { App } from './App'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
