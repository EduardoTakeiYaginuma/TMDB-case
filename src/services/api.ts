import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API error]', error.config?.url, error.response?.status, error.response?.data)
    }
    return Promise.reject(error)
  },
)

export default api
