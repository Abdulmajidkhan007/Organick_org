import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, Language } from '../types'

const getSavedDarkMode = (): boolean => {
  const saved = localStorage.getItem('organick_darkMode')
  return saved === 'true'
}

const getSavedLanguage = (): Language => {
  const saved = localStorage.getItem('i18nextLng') as Language
  return ['uz', 'en', 'ru'].includes(saved) ? saved : 'uz'
}

const initialState: UIState = {
  searchQuery: '',
  darkMode: getSavedDarkMode(),
  language: getSavedLanguage(),
  isMobileMenuOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    clearSearch(state) {
      state.searchQuery = ''
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('organick_darkMode', String(state.darkMode))
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload
      localStorage.setItem('organick_darkMode', String(action.payload))
      if (action.payload) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload
      localStorage.setItem('i18nextLng', action.payload)
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
  },
})

export const {
  setSearchQuery,
  clearSearch,
  toggleDarkMode,
  setDarkMode,
  setLanguage,
  toggleMobileMenu,
  closeMobileMenu,
} = uiSlice.actions

export default uiSlice.reducer
