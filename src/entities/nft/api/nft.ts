import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { nftListResponseSchema, nftListQuerySchema } from '@/shared/api/contracts/nft'
import { queryKeys } from '@/shared/api/query-keys'
import type { CatalogSearch } from '../model/catalog-search'

async function fetchNfts(params: CatalogSearch, signal?: AbortSignal) {
  const { data } = await http.get('/nfts', { params, signal })
  return nftListResponseSchema.parse(data)
}

export function nftListQuery(params: CatalogSearch) {
  return queryOptions({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData, // evita "piscar" ao trocar filtro/página
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
