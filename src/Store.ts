import { configureStore } from "@reduxjs/toolkit"
import { Data } from "./Data"
import cartReducer from "./slices/cartSlice"
import authReducer from "./slices/authSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    data: Data.reducer,
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type StoreRootState = ReturnType<typeof store.getState>
