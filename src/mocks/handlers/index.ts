import { http, HttpResponse } from 'msw'

export const restHandlers = [http.get('/api/health', () => HttpResponse.json({ status: 'ok' }))]
