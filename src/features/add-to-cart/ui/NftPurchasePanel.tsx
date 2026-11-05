import type { ReactNode } from 'react'
import { Link2, Share2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { StarRating } from '@/shared/ui/StarRating'
import { QuantityStepper } from '@/shared/ui/QuantityStepper'
import { NftCompactInfo } from '@/shared/ui/NftCompactInfo'
import { formatEth } from '@/shared/lib/eth'
import { useAddToCart } from '../model/useAddToCart'
import type { NftDetail } from '@/shared/api'
import { EditionChips, useEditionSelection } from '@/entities/nft'

const SHARE_ICON_CLASS =
  'text-foreground outline-none transition-colors hover:text-accent-foreground focus-visible:rounded-xs focus-visible:ring-3 focus-visible:ring-ring/50'

export function ShareBar({ name }: { name: string }) {
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedName = encodeURIComponent(name)

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copiado')
  }

  return (
    <div className="flex flex-col gap-2">
      <Text variant="body-bold">Compartilhar este NFT:</Text>
      <div className="flex items-center gap-3" role="group" aria-label="Compartilhar este NFT">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no LinkedIn"
          className={SHARE_ICON_CLASS}
        >
          <Share2 aria-hidden="true" className="size-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedName}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar no X (Twitter)"
          className={SHARE_ICON_CLASS}
        >
          <X aria-hidden="true" className="size-4" />
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copiar link"
          className={SHARE_ICON_CLASS}
        >
          <Link2 aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function NftPurchasePanel({
  nft,
  initialEditionId,
  favoriteSlot,
}: {
  nft: NftDetail
  initialEditionId?: string
  favoriteSlot?: ReactNode
}) {
  const { edition, quantity, isSoldOut, maxQuantity, selectEdition, setQuantity } =
    useEditionSelection(nft, initialEditionId)
  const addToCart = useAddToCart()

  const attributeValues = nft.attributes.map((attribute) => attribute.value).join(', ')

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Text as="h1" variant="heading">
        {nft.name}
      </Text>

      <div className="flex items-center justify-between gap-4">
        <Text variant="body-lg-bold" className="text-accent-foreground">
          {formatEth(edition.price)}
        </Text>
        <StarRating average={nft.rating.average} count={nft.rating.count} />
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <Text variant="body-bold">Sobre este NFT:</Text>
        <Text variant="body" className="text-muted-foreground">
          {nft.description}
        </Text>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Edição:</legend>
        <EditionChips editions={nft.editions} selectedId={edition.id} onSelect={selectEdition} />
      </fieldset>

      {isSoldOut ? (
        <Text role="status" variant="body" className="text-destructive">
          Esta edição está esgotada. Escolha outra edição disponível.
        </Text>
      ) : (
        <div className="flex items-center gap-4">
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => setQuantity(quantity + 1)}
            onDecrement={() => setQuantity(quantity - 1)}
            canIncrement={quantity < maxQuantity}
            canDecrement={quantity > 1}
          />
          {edition.totalSupply !== null && (
            <Text variant="caption">{edition.available} disponíveis</Text>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="default"
          disabled={isSoldOut || addToCart.isPending}
          onClick={() => addToCart.mutate({ nftId: nft.id, editionId: edition.id, quantity })}
          className="h-10 w-[130px] rounded-md text-xs font-bold tracking-wide uppercase"
        >
          {addToCart.isPending ? 'Adicionando…' : 'COMPRAR'}
        </Button>
        {favoriteSlot}
      </div>

      <NftCompactInfo
        tokenId={nft.tokenId}
        collectionName={nft.collectionName}
        attributeValues={attributeValues}
      />

      <ShareBar name={nft.name} />
    </div>
  )
}
