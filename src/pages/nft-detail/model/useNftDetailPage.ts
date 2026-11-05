import { useState } from 'react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftDetailQuery } from '@/entities/nft'
import type { NftEdition } from '@/shared/api'

function pickDefaultEdition(editions: NftEdition[]): NftEdition {
  return editions.find((edition) => edition.available > 0) ?? editions[0]!
}

function resolveSelectedEdition(editions: NftEdition[], editionId: string | undefined): NftEdition {
  const fromSearch = editionId ? editions.find((edition) => edition.id === editionId) : undefined
  return fromSearch ?? pickDefaultEdition(editions)
}

export function useNftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const search = useSearch({ from: '/nft/$nftId' })
  const navigate = useNavigate({ from: '/nft/$nftId' })

  const query = useQuery(nftDetailQuery(nftId))
  const nft = query.data

  const selectedEdition = nft ? resolveSelectedEdition(nft.editions, search.edition) : undefined

  const [quantity, setQuantityState] = useState(1)
  const [quantityEditionId, setQuantityEditionId] = useState(selectedEdition?.id)

  if (selectedEdition && selectedEdition.id !== quantityEditionId) {
    setQuantityEditionId(selectedEdition.id)
    setQuantityState(1)
  }

  function selectEdition(editionId: string) {
    navigate({ search: (prev) => ({ ...prev, edition: editionId }) })
  }

  function setQuantity(value: number) {
    const max = Math.max(1, selectedEdition?.available ?? 1)
    setQuantityState(Math.min(Math.max(1, value), max))
  }

  const canPurchase = (selectedEdition?.available ?? 0) > 0

  return {
    query,
    nft,
    selectedEdition,
    selectEdition,
    quantity,
    setQuantity,
    canPurchase,
  }
}
