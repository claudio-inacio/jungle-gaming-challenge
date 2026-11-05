import { queryOptions } from '@tanstack/react-query'
import {
  http,
  nftListResponseSchema,
  nftListQuerySchema,
  nftCollectionListResponseSchema,
  queryKeys,
} from '@/shared/api'
import type { CatalogSearch } from '../model/catalog-search'

async function fetchNfts(params: CatalogSearch, signal?: AbortSignal) {
  const { data } = await http.get('/nfts', { params, signal })
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
