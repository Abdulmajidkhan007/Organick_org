import { configureStore } from "@reduxjs/toolkit"
import { Data } from "./Data"
import cartReducer from "./slices/cartSlice"
import authReducer from "./slices/authSlice"
import uiReducer from "./slices/uiSlice"
import ordersReducer from "./slices/ordersSlice"

export const store = configureStore({
  reducer: {
    data: Data.reducer,
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    orders: ordersReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type StoreRootState = ReturnType<typeof store.getState>
