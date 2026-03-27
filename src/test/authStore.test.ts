/**
 * Tests unitarios — authStore (Zustand).
 * Cubre: setAuth, logout, updateUser, persistencia del token y datos del usuario.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, type AuthUser } from '../shared/store/authStore'

const USER_FAMILIA: AuthUser = {
  id: 1,
  email: 'test@test.com',
  rol: 'FAMILIA',
  nombre: 'Test',
  perfil_completo: false,
}

const USER_ADMIN: AuthUser = {
  id: 2,
  email: 'admin@test.com',
  rol: 'ADMIN',
  nombre: 'Admin',
  perfil_completo: true,
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, refreshToken: null, user: null })
  })

  it('estado inicial es null para token y user', () => {
    const { token, user } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })

  it('setAuth guarda el access token', () => {
    useAuthStore.getState().setAuth('access-123', 'refresh-456', USER_FAMILIA)
    expect(useAuthStore.getState().token).toBe('access-123')
  })

  it('setAuth guarda el refresh token', () => {
    useAuthStore.getState().setAuth('access-123', 'refresh-456', USER_FAMILIA)
    expect(useAuthStore.getState().refreshToken).toBe('refresh-456')
  })

  it('setAuth guarda los datos del usuario', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_FAMILIA)
    expect(useAuthStore.getState().user?.email).toBe('test@test.com')
  })

  it('setAuth con rol ADMIN guarda rol correctamente', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_ADMIN)
    expect(useAuthStore.getState().user?.rol).toBe('ADMIN')
  })

  it('logout limpia token', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_FAMILIA)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('logout limpia refreshToken', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_FAMILIA)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })

  it('logout limpia user', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_FAMILIA)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('updateUser modifica parcialmente el usuario', () => {
    useAuthStore.getState().setAuth('tok', 'ref', USER_FAMILIA)
    useAuthStore.getState().updateUser({ perfil_completo: true })
    expect(useAuthStore.getState().user?.perfil_completo).toBe(true)
    // email no cambia
    expect(useAuthStore.getState().user?.email).toBe('test@test.com')
  })

  it('updateUser con user null no falla', () => {
    // user es null → updateUser debería dejarlo en null
    useAuthStore.getState().updateUser({ nombre: 'X' })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setAuth con perfil_completo false lo guarda correctamente', () => {
    useAuthStore.getState().setAuth('tok', 'ref', { ...USER_FAMILIA, perfil_completo: false })
    expect(useAuthStore.getState().user?.perfil_completo).toBe(false)
  })
})
