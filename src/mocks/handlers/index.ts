import { http, HttpResponse } from 'msw'
import { authHandlers } from './auth'
import { nftHandlers } from './nft'
import { favoriteHandlers } from './favorite'
import { cartHandlers } from './cart'
import { quoteHandlers } from './quote'
import { orderHandlers } from './order'
import { profileHandlers } from './profile'
import { walletHandlers } from './wallet'

export const restHandlers = [
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
]
