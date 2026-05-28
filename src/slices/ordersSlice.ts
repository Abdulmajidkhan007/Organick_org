import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrdersState, Order, OrderStatus } from '../types'

const load = (): Order[] => {
  try {
    const d = localStorage.getItem('organick_orders')
    return d ? JSON.parse(d) : []
  } catch { return [] }
}
const save = (orders: Order[]) => localStorage.setItem('organick_orders', JSON.stringify(orders))

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { orders: load() } as OrdersState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload)
      save(state.orders)
    },
    updateOrderStatus(state, action: PayloadAction<{ id: string; status: OrderStatus; adminNote?: string }>) {
      const o = state.orders.find(o => o.id === action.payload.id)
      if (o) {
        o.status = action.payload.status
        if (action.payload.adminNote !== undefined) o.adminNote = action.payload.adminNote
        save(state.orders)
      }
    },
  },
})

export const { addOrder, updateOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer
