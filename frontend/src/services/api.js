import axios from 'axios'

// Use environment variable or default to localhost:9000 (for separate frontend/backend dev or port-forwarded containers).
// For reverse-proxy setups (nginx/caddy in front serving both frontend + /api → backend) set REACT_APP_API_URL=/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
