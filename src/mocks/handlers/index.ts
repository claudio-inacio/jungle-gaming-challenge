import { http, HttpResponse } from 'msw'
import { authHandlers } from './auth'
import { nftHandlers } from './nft'

export const restHandlers = [
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
  ...authHandlers,
  ...nftHandlers,
]
