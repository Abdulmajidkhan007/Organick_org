import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem, Product } from '../types'

const loadCartFromStorage = (): CartItem[] => {
  try {
    const data = localStorage.getItem('organick_cart')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveCartToStorage = (items: CartItem[]) => {
  localStorage.setItem('organick_cart', JSON.stringify(items))
}

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.product.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ product: action.payload, quantity: 1 })
      }
      saveCartToStorage(state.items)
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.product.id !== action.payload)
      saveCartToStorage(state.items)
    },
    increaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.product.id === action.payload)
      if (item) {
        item.quantity += 1
        saveCartToStorage(state.items)
      }
    },
    decreaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.product.id === action.payload)
      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter(i => i.product.id !== action.payload)
        } else {
          item.quantity -= 1
        }
        saveCartToStorage(state.items)
      }
    },
    clearCart(state) {
      state.items = []
      saveCartToStorage([])
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    openCart(state) {
      state.isOpen = true
    },
    closeCart(state) {
      state.isOpen = false
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions

export default cartSlice.reducer
