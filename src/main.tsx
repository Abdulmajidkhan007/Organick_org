import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './Fonts.css'
import './i18n/index'
import { App } from './App'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
