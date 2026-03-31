import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: number
  email: string
  nombre: string
  rol: 'ADMIN' | 'FAMILIA'
  perfil_completo: boolean
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void
  updateUser: (partial: Partial<AuthUser>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: 'pettech-auth' }
  )
)
