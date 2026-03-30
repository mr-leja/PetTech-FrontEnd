import axios from 'axios'
import { useAuthStore } from '@/shared/store/authStore'

const httpClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request; remove Content-Type for FormData so Axios sets the multipart boundary
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Flag to prevent concurrent refresh loops
let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processPendingQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  pendingQueue = []
}

// Handle 401 → try refresh → retry original request → logout only if refresh fails
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401, and never retry the refresh or login endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === '/auth/token/refresh/' ||
      originalRequest.url === '/auth/login/'
    ) {
      return Promise.reject(error)
    }

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue concurrent requests while a refresh is in progress
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(httpClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post('/api/v1/auth/token/refresh/', { refresh: refreshToken })
      const newAccessToken: string = data.access
      const newRefreshToken: string = data.refresh ?? refreshToken

      useAuthStore.getState().setAuth(newAccessToken, newRefreshToken, useAuthStore.getState().user!)
      httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      processPendingQueue(null, newAccessToken)
      return httpClient(originalRequest)
    } catch (refreshError) {
      processPendingQueue(refreshError, null)
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default httpClient
