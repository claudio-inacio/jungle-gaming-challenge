import { http, HttpResponse } from 'msw'
import {
  addFavoriteRequestSchema,
  favoriteListResponseSchema,
  favoriteSchema,
} from '@/shared/api/contracts/favorite'
import { db } from '../db/store'
import { matchOverride, withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { toNftSummary } from './nft-summary'
import { getSessionFromRequest } from './session'

export const favoriteHandlers = [
  http.get('/api/favorites', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const favoriteIds = db.get().favorites[session.userId] ?? []
      const nfts = db.get().nfts
      const items = favoriteIds
        .map((nftId) => nfts.find((n) => n.id === nftId))
        .filter((nft): nft is (typeof nfts)[number] => nft !== undefined)
        .map((nft) => toNftSummary(nft, favoriteIds))

      return HttpResponse.json(favoriteListResponseSchema.parse({ items }))
    }),
  ),

  http.post('/api/favorites', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = addFavoriteRequestSchema.parse(await request.json())

      const override = matchOverride('POST', '/api/favorites')
      if (override) return errorResponse(override.status, override.code, override.message)

      const nft = db.get().nfts.find((n) => n.id === body.nftId)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      const createdAt = new Date().toISOString()
      db.update((d) => {
        const current = d.favorites[session.userId] ?? []
        if (!current.includes(body.nftId)) {
          d.favorites[session.userId] = [...current, body.nftId]
        } else {
          d.favorites[session.userId] = current
        }
      })

      return HttpResponse.json(favoriteSchema.parse({ nftId: body.nftId, createdAt }), {
        status: 201,
      })
    }),
  ),

  http.delete('/api/favorites/:nftId', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const override = matchOverride('DELETE', '/api/favorites/:nftId')
      if (override) return errorResponse(override.status, override.code, override.message)

      const nftId = params.nftId as string
      db.update((d) => {
        const current = d.favorites[session.userId] ?? []
        d.favorites[session.userId] = current.filter((id) => id !== nftId)
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
