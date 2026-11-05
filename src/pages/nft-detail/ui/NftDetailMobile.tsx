import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Text } from '@/shared/ui/Text'
import { StarRating } from '@/shared/ui/StarRating'
import { QuantityStepper } from '@/shared/ui/QuantityStepper'
import { NftCompactInfo } from '@/shared/ui/NftCompactInfo'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { Container } from '@/shared/ui/container'
import { formatEth } from '@/shared/lib/eth'
import { EditionChips, useEditionSelection } from '@/entities/nft'
import { useAddToCart, ShareBar } from '@/features/add-to-cart'
import { FavoriteButton } from '@/features/toggle-favorite'
import { NftDetailTabs } from '@/widgets/nft-detail-tabs'
import { RelatedNfts } from '@/widgets/related-nfts'
import type { NftDetail } from '@/shared/api'

type Props = {
  nft: NftDetail
  initialEditionId?: string
}

export function NftDetailMobile({ nft, initialEditionId }: Props) {
  const router = useRouter()
  const { edition, quantity, isSoldOut, maxQuantity, selectEdition, setQuantity } =
    useEditionSelection(nft, initialEditionId)
  const addToCart = useAddToCart()

  const attributeValues = nft.attributes.map((attribute) => attribute.value).join(', ')

  return (
    <div className="flex flex-col gap-10 pb-[180px]">
      <div className="flex flex-col gap-10">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-card to-surface-raised">
          <img
            src={nft.images[0]}
            alt={`Imagem principal de ${nft.name}`}
            fetchPriority="high"
            width={361}
            height={356}
            className="h-[356px] w-full rounded-[24px] object-cover"
          />
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Voltar"
            className="absolute top-6 left-6 flex size-9 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <FavoriteButton
            nftId={nft.id}
            isFavorited={nft.isFavorited}
            variant="icon"
            className="absolute top-6 right-6"
          />
        </div>

        <div className="-mt-3 flex flex-col gap-4 rounded-t-[31px] bg-card px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-3">
            <Text as="h1" variant="heading" className="text-[20px]">
              {nft.name}
            </Text>
            <StarRating average={nft.rating.average} count={nft.rating.count} variant="compact" />
          </div>

          <Text variant="body" className="text-muted-foreground">
            {nft.description}
          </Text>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0 text-sm font-bold text-foreground">Edição:</legend>
            <EditionChips
              editions={nft.editions}
              selectedId={edition.id}
              onSelect={selectEdition}
            />
          </fieldset>

          <NftCompactInfo
            tokenId={nft.tokenId}
            collectionName={nft.collectionName}
            attributeValues={attributeValues}
          />
        </div>

        <Container>
          <ShareBar name={nft.name} />
        </Container>
      </div>

      <Container className="flex flex-col gap-10">
        <NftDetailTabs nft={nft} />
        <RelatedNfts collectionId={nft.collectionId} currentNftId={nft.id} />
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-5 rounded-t-[32px] bg-card px-6 pt-5 pb-7 shadow-[0_0_10px_rgba(10,6,4,0.45)]">
        {isSoldOut ? (
          <Text role="status" variant="body" className="text-destructive">
            Esta edição está esgotada. Escolha outra edição disponível.
          </Text>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Text variant="body" className="text-muted-foreground">
                Qtd.
              </Text>
              <QuantityStepper
                size="compact"
                quantity={quantity}
                onIncrement={() => setQuantity(quantity + 1)}
                onDecrement={() => setQuantity(quantity - 1)}
                canIncrement={quantity < maxQuantity}
                canDecrement={quantity > 1}
              />
            </div>
            <Text variant="body-lg-bold" className="text-[20px] text-accent-foreground">
              {formatEth(edition.price)}
            </Text>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSoldOut || addToCart.isPending}
            onClick={() => addToCart.mutate({ nftId: nft.id, editionId: edition.id, quantity })}
            className="bg-gradient-accent flex h-[52px] flex-1 items-center justify-center rounded-full text-base font-bold text-primary-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {addToCart.isPending ? 'Adicionando…' : 'Comprar NFT'}
          </button>
          <OutOfScopeButton
            variant="outline"
            aria-label="Ver carrinho"
            className="size-[52px] shrink-0 rounded-full border-border p-0"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
          </OutOfScopeButton>
        </div>
      </div>
    </div>
  )
}
