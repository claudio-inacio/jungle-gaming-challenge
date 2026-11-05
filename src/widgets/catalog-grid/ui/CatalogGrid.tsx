import { useQuery } from '@tanstack/react-query'
import { nftListQuery } from '@/entities/nft'
import { NftCard } from '@/entities/nft'
import { EmptyState, ErrorState } from '@/shared/ui/QueryState'
import { Pagination } from './Pagination'
import type { CatalogSearch } from '@/entities/nft'
import { NftCardSkeleton } from '@/shared/ui/NftCardSkeleton'

export function CatalogGrid({ search }: { search: CatalogSearch }) {
  const query = useQuery(nftListQuery(search))

  if (query.isPending) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="grid grid-cols-2 gap-card-gap md:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,258px))]"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <NftCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <ErrorState description="Não foi possível carregar o catálogo." onRetry={query.refetch} />
    )
  }

  if (query.data.items.length === 0) {
    return (
      <EmptyState
        title="Nenhum NFT encontrado"
        description="Ajuste os filtros e tente novamente."
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-card-gap gap-y-row-gap md:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,258px))]">
        {query.data.items.map((nft) => (
          <NftCard key={nft.id} nft={nft} />
        ))}
      </div>
      <Pagination page={search.page} total={query.data.total} pageSize={query.data.pageSize} />
    </div>
  )
}
