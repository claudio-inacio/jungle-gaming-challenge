import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { nftListQuery, NftCard } from '@/entities/nft'
import { NftCardSkeleton } from '@/shared/ui/NftCardSkeleton'
import { useMediaQuery } from '@/shared/lib/hooks'

const MAX_RELATED_ITEMS = 10

type Props = {
  collectionId: string
  currentNftId: string
}

function usePerPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  if (isDesktop) return 5
  if (isTablet) return 3
  return 2
}

export function RelatedNfts({ collectionId, currentNftId }: Props) {
  const perPage = usePerPage()
  const [page, setPage] = useState(0)

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
        <div
          className="grid justify-center gap-4"
          style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 15.25rem))` }}
        >
          {Array.from({ length: perPage }, (_, index) => (
            <NftCardSkeleton key={index} />
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

  const pageCount = Math.ceil(relatedItems.length / perPage)
  const currentPage = Math.min(page, pageCount - 1)
  const visibleItems = relatedItems.slice(currentPage * perPage, currentPage * perPage + perPage)

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">Mais desta coleção</h2>
      <div
        className="grid justify-center gap-4"
        style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 15.25rem))` }}
      >
        {visibleItems.map((nft) => (
          <NftCard key={nft.id} nft={nft} />
        ))}
      </div>

      {pageCount > 1 && (
        <div
          role="group"
          aria-label="Páginas de NFTs relacionados"
          className="mt-6 flex items-center justify-center gap-2"
        >
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir para página ${index + 1} de ${pageCount}`}
              aria-current={index === currentPage}
              onClick={() => setPage(index)}
              className={
                index === currentPage
                  ? 'h-2 w-6 rounded-full bg-primary'
                  : 'size-2 rounded-full bg-border-soft'
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}
