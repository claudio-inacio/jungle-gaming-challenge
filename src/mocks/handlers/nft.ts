import { http, HttpResponse } from 'msw'
import {
  nftDetailSchema,
  nftListQuerySchema,
  nftListResponseSchema,
  nftCollectionListResponseSchema,
} from '@/shared/api/contracts/nft'
import { compareEth } from '@/shared/lib/eth'
import { db } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { toNftSummary } from './nft-summary'
import { getSessionFromRequest } from './session'

// `favorited` nunca é um campo estático do NFT - é sempre relativo a quem está
// pedindo. Sem sessão válida, não há usuário: tudo false.
function favoriteIdsFromRequest(request: Request): readonly string[] {
  const session = getSessionFromRequest(request)
  if (!session) return []
  return db.get().favorites[session.userId] ?? []
}

function parseQueryParams(url: URL) {
  const sp = url.searchParams
  const collections = sp.getAll('collections')
  return nftListQuerySchema.parse({
    q: sp.get('q') ?? undefined,
    collections: collections.length > 0 ? collections : undefined,
    priceMin: sp.get('priceMin') ?? undefined,
    priceMax: sp.get('priceMax') ?? undefined,
    network: sp.get('network') ?? undefined,
    tab: sp.get('tab') ?? undefined,
    sortBy: sp.get('sortBy') ?? undefined,
    page: sp.has('page') ? Number(sp.get('page')) : undefined,
    pageSize: sp.has('pageSize') ? Number(sp.get('pageSize')) : undefined,
  })
}

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) =>
    withScenario(() => {
      const url = new URL(request.url)
      const query = parseQueryParams(url)
      const favoriteIds = favoriteIdsFromRequest(request)

      let items = db.get().nfts.slice()

      if (query.q) {
        const needle = query.q.toLowerCase()
        items = items.filter((nft) => nft.name.toLowerCase().includes(needle))
      }

      if (query.collections && query.collections.length > 0) {
        const collectionSet = new Set(query.collections)
        items = items.filter((nft) => collectionSet.has(nft.collectionId))
      }

      if (query.network) {
        items = items.filter((nft) => nft.network === query.network)
      }

      if (query.priceMin) {
        items = items.filter((nft) => compareEth(nft.price, query.priceMin!) >= 0)
      }

      if (query.priceMax) {
        items = items.filter((nft) => compareEth(nft.price, query.priceMax!) <= 0)
      }

      if (query.tab === 'new') {
        items = items.filter((nft) => nft.isNew)
      } else if (query.tab === 'trending') {
        items = items.filter((nft) => nft.isTrending)
      }

      if (query.sortBy === 'price_asc') {
        items = items.slice().sort((a, b) => compareEth(a.price, b.price))
      } else if (query.sortBy === 'price_desc') {
        items = items.slice().sort((a, b) => compareEth(b.price, a.price))
      } else if (query.sortBy === 'newest') {
        items = items
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      const total = items.length
      const start = (query.page - 1) * query.pageSize
      const paged = items
        .slice(start, start + query.pageSize)
        .map((nft) => toNftSummary(nft, favoriteIds))

      return HttpResponse.json(
        nftListResponseSchema.parse({
          items: paged,
          page: query.page,
          pageSize: query.pageSize,
          total,
        }),
      )
    }),
  ),

  // Precisa vir antes de `/api/nfts/:id` - MSW casa rotas na ordem declarada, e
  // `:id` casaria com o literal "collections" primeiro se viesse antes.
  http.get('/api/nfts/collections', async () =>
    withScenario(() => {
      const counts = new Map<string, { name: string; count: number }>()
      for (const nft of db.get().nfts) {
        const entry = counts.get(nft.collectionId)
        if (entry) {
          entry.count += 1
        } else {
          counts.set(nft.collectionId, { name: nft.collectionName, count: 1 })
        }
      }

      const collections = Array.from(counts.entries()).map(([id, { name, count }]) => ({
        id,
        name,
        count,
      }))

      return HttpResponse.json(nftCollectionListResponseSchema.parse(collections))
    }),
  ),

  http.get('/api/nfts/:id', async ({ params, request }) =>
    withScenario(() => {
      const nft = db.get().nfts.find((n) => n.id === params.id)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      const favoriteIds = favoriteIdsFromRequest(request)
      return HttpResponse.json(
        nftDetailSchema.parse({ ...nft, favorited: favoriteIds.includes(nft.id) }),
      )
    }),
  ),
]
