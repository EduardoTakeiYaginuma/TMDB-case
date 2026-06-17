import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token from persisted auth store without importing the store
// directly (avoids circular dependency: api → authStore → authService → api).
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('cinerate-auth')
    if (raw) {
      const token = JSON.parse(raw)?.state?.token as string | undefined
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore malformed JSON
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted auth and notify the app to reset state
      localStorage.removeItem('cinerate-auth')
      window.dispatchEvent(new CustomEvent('cinerate:auth-expired'))
    }
    if (import.meta.env.DEV) {
      console.error('[API error]', error.config?.url, error.response?.status, error.response?.data)
    }
    return Promise.reject(error)
  },
)

export default api
