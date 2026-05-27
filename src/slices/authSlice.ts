import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, AuthUser } from '../types'

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.loading = false
    },
    logout(state) {
      state.user = null
      state.error = null
      state.loading = false
    },
  },
})

export const { setUser, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer
