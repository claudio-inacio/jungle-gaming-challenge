import type { NftDetail, NftSummary } from '@/shared/api/contracts/nft'

/**
 * `favorited` nunca vem fixo da fixture - é sempre relativo a quem está pedindo.
 * `favoriteIds` é o conjunto de nftId favoritados pelo usuário autenticado (ou
 * vazio/undefined para requests sem sessão, onde favorited é sempre false).
 */
export function toNftSummary(nft: NftDetail, favoriteIds?: readonly string[]): NftSummary {
  const favorited = favoriteIds?.includes(nft.id) ?? false

  return {
    id: nft.id,
    tokenId: nft.tokenId,
    name: nft.name,
    collectionId: nft.collectionId,
    collectionName: nft.collectionName,
    image: nft.image,
    price: nft.price,
    previousPrice: nft.previousPrice,
    network: nft.network,
    isRare: nft.isRare,
    favorited,
    available: nft.available,
  }
}
