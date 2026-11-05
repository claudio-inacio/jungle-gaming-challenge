import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { formatEth } from '@/shared/lib/eth'
import { useAddToCart } from '../model/useAddToCart'
import type { NftSummary } from '@/shared/api'
import { useEditionSelection } from '@/entities/nft'

export function NftPurchasePanel({
  nft,
  initialEditionId,
}: {
  nft: NftSummary
  initialEditionId?: string
}) {
  const { edition, quantity, isSoldOut, maxQuantity, selectEdition, setQuantity } =
    useEditionSelection(nft, initialEditionId)
  const addToCart = useAddToCart()

  return (
    <div className="flex flex-col gap-6 flex-1">
      <Text as="h1" variant="heading">
        {nft.name}
      </Text>
      <Text variant="body-lg" className="text-accent-foreground">
        {formatEth(edition.price)}
      </Text>

      <fieldset>
        <legend className="text-sm font-bold mb-2">Edição</legend>
        <div className="flex gap-2 flex-wrap">
          {nft.editions.map((e) => (
            <button
              key={e.id}
              type="button"
              disabled={e.available === 0}
              aria-pressed={e.id === edition.id}
              onClick={() => selectEdition(e.id)}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Badge variant="edition">
                {e.label === 'open' ? 'ABERTA' : e.label}
                {e.available === 0 && ' · esgotada'}
              </Badge>
            </button>
          ))}
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
          <div className="flex items-center border border-border rounded-full">
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

      <div className="flex gap-3">
        <Button
          variant="pill"
          disabled={isSoldOut || addToCart.isPending}
          onClick={() => addToCart.mutate({ nftId: nft.id, editionId: edition.id, quantity })}
        >
          {addToCart.isPending ? 'Adicionando…' : 'COMPRAR'}
        </Button>
      </div>
    </div>
  )
}
