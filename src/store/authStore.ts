import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import { login as apiLogin, register as apiRegister } from '@/services/authService'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (payload) => {
        const { user, token } = await apiLogin(payload)
        set({ user, token, isAuthenticated: true })
      },

      register: async (payload) => {
        const { user, token } = await apiRegister(payload)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'cinerate-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
