import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatEth, mulEth } from '@/shared/lib/eth'
import type { CartItem, Quote } from '@/shared/api'

export function CheckoutItemsPanel({
  items,
  quote,
  isQuoteLoading,
  isQuoteError,
}: {
  items: CartItem[]
  quote: Quote | null
  isQuoteLoading: boolean
  isQuoteError: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-3 lg:w-[405px] lg:shrink-0">
      <Text variant="body-bold" className="text-base">
        Seus NFTs
      </Text>

      <div className="flex flex-col gap-3 pb-3">
        <div className="flex items-center justify-between text-base">
          <Text variant="body-bold">NFTs</Text>
          <Text variant="body-bold">Subtotal</Text>
        </div>
        <div aria-hidden="true" className="h-px w-full bg-border" />
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={`${item.nftId}-${item.editionId}`}
            className="flex h-[70px] items-center justify-between gap-3 bg-card pr-4 pl-1"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt=""
                width={70}
                height={70}
                className="size-[70px] rounded-lg object-cover"
              />
              <div>
                <Text variant="body-bold">{item.name}</Text>
                <Text variant="caption">
                  ID do token: {item.tokenId} (x{item.quantity})
                </Text>
              </div>
            </div>
            <Text variant="body-bold" className="whitespace-nowrap">
              {formatEth(mulEth(item.unitPrice, item.quantity))}
            </Text>
          </li>
        ))}
      </ul>

      {isQuoteLoading && (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}

      {isQuoteError && (
        <Text role="alert" className="text-destructive">
          Não foi possível calcular o total.
        </Text>
      )}

      {quote && !isQuoteLoading && !isQuoteError && (
        <div className="flex flex-col gap-3">
          <Text variant="body">
            {quote.couponStatus === 'applied' && quote.couponCode
              ? `Cupom ${quote.couponCode} aplicado`
              : 'Nenhum cupom aplicado'}
          </Text>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatEth(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Desconto do lançamento</dt>
              <dd>
                {quote.discount === '0' ? '(-) 0.00 ETH' : `(-) ${formatEth(quote.discount)}`}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <dt>Taxa de rede</dt>
                <dd>{formatEth(quote.networkFee)}</dd>
              </div>
              <span className="text-xs text-accent-foreground">Taxa estimada</span>
            </div>
          </dl>
          <div aria-hidden="true" className="h-px w-full bg-border" />
          <div className="flex justify-between">
            <Text variant="body-bold">Total</Text>
            <Text variant="body-bold" className="text-accent-foreground">
              {formatEth(quote.total)}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}
