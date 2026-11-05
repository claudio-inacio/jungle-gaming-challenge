import { useState, useMemo } from 'react'
import type { NftSummary, NftEdition } from '@/shared/api'

export function useEditionSelection(nft: NftSummary, initialEditionId?: string) {
  const defaultEdition = nft.editions.find((e) => e.available > 0) ?? nft.editions[0]
  const [editionId, setEditionId] = useState(initialEditionId ?? defaultEdition?.id)
  const [quantity, setQuantity] = useState(1)

  const edition = useMemo<NftEdition>(
    () => nft.editions.find((e) => e.id === editionId) ?? defaultEdition!,
    [nft.editions, editionId, defaultEdition],
  )

  const isSoldOut = edition.available === 0
  const maxQuantity = edition.totalSupply === null ? 10 : Math.min(edition.available, 10)

  function selectEdition(id: string) {
    setEditionId(id)
    setQuantity(1)
  }

  function setQuantitySafe(next: number) {
    setQuantity(Math.min(Math.max(1, next), Math.max(maxQuantity, 1)))
  }

  return { edition, quantity, isSoldOut, maxQuantity, selectEdition, setQuantity: setQuantitySafe }
}
