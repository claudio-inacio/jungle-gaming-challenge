import { queryOptions } from '@tanstack/react-query'
import {
  http,
  nftListResponseSchema,
  nftListQuerySchema,
  nftCollectionListResponseSchema,
  queryKeys,
  type NftListSort,
} from '@/shared/api'
import type { CatalogSearch } from '../model/catalog-search'

const SORT_TO_SORT_BY: Record<CatalogSearch['sort'], NftListSort> = {
  recent: 'newest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
}

function buildNftListParams(search: CatalogSearch): URLSearchParams {
  const params = new URLSearchParams()
  if (search.q) params.set('q', search.q)
  for (const collectionId of search.collections) params.append('collections', collectionId)
  for (const network of search.network) params.append('network', network)
  if (search.priceMin !== undefined) params.set('priceMin', search.priceMin.toFixed(2))
  if (search.priceMax !== undefined) params.set('priceMax', search.priceMax.toFixed(2))
  params.set('tab', search.tab)
  params.set('sortBy', SORT_TO_SORT_BY[search.sort])
  params.set('page', String(search.page))
  return params
}

async function fetchNfts(search: CatalogSearch, signal?: AbortSignal) {
  const { data } = await http.get('/nfts', { params: buildNftListParams(search), signal })
  return nftListResponseSchema.parse(data)
}

export function nftListQuery(params: CatalogSearch) {
  return queryOptions({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
  })
}

export function nftCollectionsQuery() {
  return queryOptions({
    queryKey: queryKeys.nfts.collections(),
    queryFn: async ({ signal }) => {
      const { data } = await http.get('/nfts/collections', { signal })
      return nftCollectionListResponseSchema.parse(data)
    },
    staleTime: 60_000,
  })
}

export function nftDetailQuery(id: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.detail(id),
    queryFn: async ({ signal }) => {
      const { data } = await http.get(`/nfts/${id}`, { signal })
      return nftListQuerySchema.parse(data)
    },
  })
}
