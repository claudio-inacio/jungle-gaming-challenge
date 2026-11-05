import axios from 'axios'
import { env } from '@/shared/config'
import { apiErrorSchema, ApiError } from './contracts/error'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startedAt: number }
  }
}

/**
 * Minimum duration every REST request appears to take, so loading states are
 * visible and consistent even against the mocks' near-instant responses.
 * Applies uniformly to success and error paths; socket.io traffic is separate
 * and unaffected.
 */
const SIMULATED_REQUEST_DELAY_MS = 3000

export const http = axios.create({ baseURL: env.apiUrl, timeout: 10_000 })

let accessToken: string | null = null
export function setAccessToken(token: string | null) {
  accessToken = token
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  config.metadata = { startedAt: Date.now() }
  return config
})

async function waitForSimulatedDelay(startedAt?: number) {
  const elapsed = Date.now() - (startedAt ?? Date.now())
  const remaining = SIMULATED_REQUEST_DELAY_MS - elapsed
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
}

http.interceptors.response.use(
  async (response) => {
    await waitForSimulatedDelay(response.config.metadata?.startedAt)
    return response
  },
  async (error) => {
    await waitForSimulatedDelay(error.config?.metadata?.startedAt)
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
