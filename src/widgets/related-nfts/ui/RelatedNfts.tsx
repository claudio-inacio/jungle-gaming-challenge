import { useQuery } from '@tanstack/react-query'
import { nftListQuery, NftCard } from '@/entities/nft'
import { NftCardSkeleton } from '@/shared/ui/NftCardSkeleton'

const MAX_RELATED_ITEMS = 8

type Props = {
  collectionId: string
  currentNftId: string
}

export function RelatedNfts({ collectionId, currentNftId }: Props) {
  const query = useQuery(
    nftListQuery({
      collections: [collectionId],
      network: [],
      tab: 'all',
      sort: 'recent',
      page: 1,
    }),
  )

  if (query.isPending) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-bold">Mais desta coleção</h2>
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="min-w-61 shrink-0">
              <NftCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (query.isError) {
    return null
  }

  const relatedItems = query.data.items
    .filter((item) => item.id !== currentNftId)
    .slice(0, MAX_RELATED_ITEMS)

  if (relatedItems.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">Mais desta coleção</h2>
      <div className="flex gap-4 overflow-x-auto snap-x">
        {relatedItems.map((nft) => (
          <div key={nft.id} className="min-w-61 shrink-0 snap-start">
            <NftCard nft={nft} />
          </div>
        ))}
      </div>
    </section>
  )
}
