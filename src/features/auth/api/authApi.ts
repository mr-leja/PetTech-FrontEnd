import httpClient from '@/shared/api/httpClient'
import type { AuthUser } from '@/shared/store/authStore'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  id: number
  email: string
  nombre: string
  rol: 'ADMIN' | 'FAMILIA'
  perfil_completo: boolean
}

export interface RegistroPayload {
  email: string
  password: string
  password_confirm: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post<LoginResponse>('/auth/login/', payload).then((r) => r.data),

  registro: (payload: RegistroPayload) =>
    httpClient.post('/auth/registro/', payload).then((r) => r.data),

  perfil: () =>
    httpClient.get<AuthUser>('/auth/perfil/').then((r) => r.data),
}
