import { Link, notFound, useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftDetailQuery } from '@/entities/nft'
import { ApiError } from '@/shared/api'
import { ErrorState } from '@/shared/ui/QueryState'
import { Container } from '@/shared/ui/container'
import { Text } from '@/shared/ui/Text'
import { NftGallery } from '@/widgets/nft-gallery'
import { NftDetailTabs } from '@/widgets/nft-detail-tabs'
import { RelatedNfts } from '@/widgets/related-nfts'
import { NftDetailSkeleton } from '@/shared/ui/NftDetailSkeleton'
import { NftPurchasePanel } from '@/features/add-to-cart'
import { FavoriteButton } from '@/features/toggle-favorite'
import { useMediaQuery } from '@/shared/lib/hooks'
import { NftDetailMobile } from './NftDetailMobile'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { edition } = useSearch({ from: '/nft/$nftId' })
  const query = useQuery(nftDetailQuery(nftId))
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (query.isPending) {
    return (
      <Container>
        <NftDetailSkeleton />
      </Container>
    )
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.code === 'NOT_FOUND') {
      throw notFound()
    }
    return (
      <Container>
        <ErrorState description="Não foi possível carregar este NFT." onRetry={query.refetch} />
      </Container>
    )
  }

  const nft = query.data

  if (!isDesktop) {
    return <NftDetailMobile nft={nft} initialEditionId={edition} />
  }

  return (
    <Container>
      <main className="flex flex-col gap-12">
        <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5">
          <Link
            to="/"
            className="text-sm font-normal text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Início
          </Link>
          <Text variant="caption" aria-hidden="true">
            /
          </Text>
          <Text variant="caption">Mercado</Text>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-1/2">
            <NftGallery images={nft.images} alt={nft.name} />
          </div>
          <NftPurchasePanel
            nft={nft}
            initialEditionId={edition}
            favoriteSlot={
              <FavoriteButton nftId={nft.id} isFavorited={nft.isFavorited} variant="button" />
            }
          />
        </div>

        <NftDetailTabs nft={nft} />
        <RelatedNfts collectionId={nft.collectionId} currentNftId={nft.id} />
      </main>
    </Container>
  )
}
