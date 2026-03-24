import axios from 'axios'
import { useAuthStore } from '@/shared/store/authStore'

const httpClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 → logout
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default httpClient
