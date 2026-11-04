import { http, setAccessToken } from '@/shared/api/http'
import {
  sessionSchema,
  loginRequestSchema,
  registerRequestSchema,
  type Session,
} from '@/shared/api/contracts/session'
import { z } from 'zod'

export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  const { data } = await http.get('/auth/session', { signal })
  return sessionSchema.parse(data)
}

export async function login(body: z.infer<typeof loginRequestSchema>): Promise<Session> {
  const { data } = await http.post('/auth/login', loginRequestSchema.parse(body))
  return sessionSchema.parse(data)
}

export async function register(body: z.infer<typeof registerRequestSchema>): Promise<Session> {
  const { data } = await http.post('/auth/register', registerRequestSchema.parse(body))
  return sessionSchema.parse(data)
}

export async function logoutRequest(): Promise<void> {
  await http.post('/auth/logout')
  setAccessToken(null)
}
