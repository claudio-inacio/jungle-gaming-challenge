import axios from 'axios'
import { env } from '@/shared/config'
import { apiErrorSchema, ApiError } from './contracts/error'

export const http = axios.create({ baseURL: env.apiUrl, timeout: 10_000 })

let accessToken: string | null = null
export function setAccessToken(token: string | null) {
  accessToken = token
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsed = apiErrorSchema.safeParse(error.response?.data)
    if (parsed.success) {
      const apiError = new ApiError(error.response.status, parsed.data)
      if (apiError.code === 'UNAUTHORIZED') {
        setAccessToken(null)
        window.dispatchEvent(new CustomEvent('session:expired'))
      }
      return Promise.reject(apiError)
    }
    return Promise.reject(error)
  },
)
