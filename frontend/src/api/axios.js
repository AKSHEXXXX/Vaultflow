import axios from 'axios'
import { addToastGlobal, showForbiddenModal } from '../context/ToastContext'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    } else if (status === 403) {
      showForbiddenModal()
    } else if (status === 429) {
      addToastGlobal('Too many requests — please slow down.', 'warning')
    } else if (status >= 500) {
      addToastGlobal('Server error. Please try again later.', 'error')
    }

    return Promise.reject(error)
  },
)

export default api
