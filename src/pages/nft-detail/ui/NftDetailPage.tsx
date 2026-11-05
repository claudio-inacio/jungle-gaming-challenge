import { notFound, useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftDetailQuery } from '@/entities/nft'
import { ApiError } from '@/shared/api'
import { ErrorState } from '@/shared/ui/QueryState'
import { NftGallery } from '@/widgets/nft-gallery'
import { NftDetailTabs } from '@/widgets/nft-detail-tabs'
import { RelatedNfts } from '@/widgets/related-nfts'
import { NftDetailSkeleton } from '@/shared/ui/NftDetailSkeleton'
import { NftPurchasePanel } from '@/features/add-to-cart'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { edition } = useSearch({ from: '/nft/$nftId' })
  const query = useQuery(nftDetailQuery(nftId))

  if (query.isPending) return <NftDetailSkeleton />

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.code === 'NOT_FOUND') {
      throw notFound()
    }
    return <ErrorState description="Não foi possível carregar este NFT." onRetry={query.refetch} />
  }

  const nft = query.data

  return (
    <main className="flex flex-col gap-12">
      <div className="flex gap-10">
        <NftGallery
          images={nft.images}
          alt={nft.name}
          nftId={nft.id}
          isFavorited={nft.isFavorited}
        />
        <NftPurchasePanel nft={nft} initialEditionId={edition} />
      </div>
      <NftDetailTabs nft={nft} />
      <RelatedNfts collectionId={nft.collectionId} currentNftId={nft.id} />
    </main>
  )
}
