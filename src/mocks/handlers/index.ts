import { http, HttpResponse } from 'msw'
import { authHandlers } from './auth'

export const restHandlers = [
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
  ...authHandlers,
]
