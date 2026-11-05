import { useEffect, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { ApiError, type NftDetail, type CartItem } from '@/shared/api'
import { nftDetailQuery } from '@/entities/nft/@x/cart'
import { guestCartStorage, type GuestCartItem } from './guest-cart-storage'

interface UseGuestCartItemsResult {
  items: CartItem[]
  isPending: boolean
  isError: boolean
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'NOT_FOUND'
}

export function useGuestCartItems(): UseGuestCartItemsResult {
  const savedItems = guestCartStorage.get()
  const uniqueNftIds = useMemo(
    () => Array.from(new Set(savedItems.map((item) => item.nftId))),
    [savedItems],
  )

  const queries = useQueries({
    queries: uniqueNftIds.map((nftId) => nftDetailQuery(nftId)),
  })

  const notFoundNftIds = useMemo(
    () =>
      queries
        .map((query, index) => ({ query, nftId: uniqueNftIds[index] }))
        .filter(({ query }) => query.isError && isNotFoundError(query.error))
        .map(({ nftId }) => nftId)
        .filter((nftId): nftId is string => nftId !== undefined),
    [queries, uniqueNftIds],
  )

  useEffect(() => {
    if (notFoundNftIds.length === 0) return
    const current = guestCartStorage.get()
    const next = current.filter((item) => !notFoundNftIds.includes(item.nftId))
    if (next.length !== current.length) guestCartStorage.set(next)
  }, [notFoundNftIds])

  const nftById = useMemo(() => {
    const map = new Map<string, NftDetail>()
    uniqueNftIds.forEach((nftId, index) => {
      const data = queries[index]?.data
      if (data) map.set(nftId, data)
    })
    return map
  }, [uniqueNftIds, queries])

  const staleEditionRows = useMemo(
    () =>
      savedItems.filter((item) => {
        const nft = nftById.get(item.nftId)
        if (!nft) return false
        return !nft.editions.some((edition) => edition.id === item.editionId)
      }),
    [savedItems, nftById],
  )

  useEffect(() => {
    if (staleEditionRows.length === 0) return
    const current = guestCartStorage.get()
    const next = current.filter(
      (item) =>
        !staleEditionRows.some(
          (stale) => stale.nftId === item.nftId && stale.editionId === item.editionId,
        ),
    )
    if (next.length !== current.length) guestCartStorage.set(next)
  }, [staleEditionRows])

  const items = useMemo(() => buildCartItems(savedItems, nftById), [savedItems, nftById])

  const isPending = queries.some((query) => query.isPending)
  const isError = queries.some((query) => query.isError && !isNotFoundError(query.error))

  return { items, isPending, isError }
}

function buildCartItems(savedItems: GuestCartItem[], nftById: Map<string, NftDetail>): CartItem[] {
  const items: CartItem[] = []
  for (const savedItem of savedItems) {
    const nft = nftById.get(savedItem.nftId)
    if (!nft) continue
    const edition = nft.editions.find((candidate) => candidate.id === savedItem.editionId)
    if (!edition) continue
    items.push({
      nftId: savedItem.nftId,
      editionId: savedItem.editionId,
      editionLabel: edition.label,
      name: nft.name,
      tokenId: nft.tokenId,
      image: nft.image,
      unitPrice: edition.price,
      quantity: savedItem.quantity,
      available: edition.available,
    })
  }
  return items
}
