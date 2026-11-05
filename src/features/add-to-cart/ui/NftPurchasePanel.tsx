import type { ReactNode } from 'react'
import { Link2, Share2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { StarRating } from '@/shared/ui/StarRating'
import { formatEth } from '@/shared/lib/eth'
import { cn } from '@/shared/lib/utils'
import { useAddToCart } from '../model/useAddToCart'
import type { NftDetail } from '@/shared/api'
import { useEditionSelection } from '@/entities/nft'

function ShareBar({ name }: { name: string }) {
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
      <div className="flex items-center gap-2" role="group" aria-label="Compartilhar este NFT">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no LinkedIn"
            />
          }
        >
          <Share2 aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedName}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no X (Twitter)"
            />
          }
        >
          <X aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Copiar link"
          onClick={copyLink}
        >
          <Link2 aria-hidden="true" />
        </Button>
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

      <div className="flex flex-wrap items-center gap-4">
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

      <fieldset>
        <legend className="mb-2 text-sm font-bold">Edição:</legend>
        <div className="flex flex-wrap gap-2">
          {nft.editions.map((e) => {
            const isSelected = e.id === edition.id
            return (
              <button
                key={e.id}
                type="button"
                disabled={e.available === 0}
                aria-pressed={isSelected}
                onClick={() => selectEdition(e.id)}
                className="rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Badge
                  variant="edition"
                  className={cn(
                    'border-2',
                    isSelected
                      ? 'border-primary font-extrabold underline decoration-2 underline-offset-2'
                      : 'border-border-soft',
                  )}
                >
                  {e.label === 'open' ? 'ABERTA' : e.label}
                  {e.available === 0 && ' · esgotada'}
                </Badge>
              </button>
            )
          })}
        </div>
      </fieldset>

      {isSoldOut ? (
        <Text role="status" variant="body" className="text-destructive">
          Esta edição está esgotada. Escolha outra edição disponível.
        </Text>
      ) : (
        <div className="flex items-center gap-4">
          <label htmlFor="quantity" className="sr-only">
            Quantidade
          </label>
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              aria-label="Diminuir quantidade"
              className="px-3 py-1"
            >
              −
            </button>
            <span id="quantity" aria-live="polite" className="px-2 tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= maxQuantity}
              aria-label="Aumentar quantidade"
              className="px-3 py-1"
            >
              +
            </button>
          </div>
          {edition.totalSupply !== null && (
            <Text variant="caption">{edition.available} disponíveis</Text>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="pill"
          disabled={isSoldOut || addToCart.isPending}
          onClick={() => addToCart.mutate({ nftId: nft.id, editionId: edition.id, quantity })}
        >
          {addToCart.isPending ? 'Adicionando…' : 'COMPRAR'}
        </Button>
        {favoriteSlot}
      </div>

      <dl className="flex flex-col gap-1">
        <div className="flex gap-2">
          <dt>
            <Text variant="caption">ID do token:</Text>
          </dt>
          <dd>
            <Text variant="caption" className="text-foreground">
              {nft.tokenId}
            </Text>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt>
            <Text variant="caption">Coleção:</Text>
          </dt>
          <dd>
            <Text variant="caption" className="text-foreground">
              {nft.collectionName}
            </Text>
          </dd>
        </div>
        {attributeValues.length > 0 && (
          <div className="flex gap-2">
            <dt>
              <Text variant="caption">Atributos:</Text>
            </dt>
            <dd>
              <Text variant="caption" className="text-foreground">
                {attributeValues}
              </Text>
            </dd>
          </div>
        )}
      </dl>

      <ShareBar name={nft.name} />
    </div>
  )
}
