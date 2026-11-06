import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Text } from '@/shared/ui/Text'
import { formatEth, mulEth } from '@/shared/lib/eth'
import { useUpdateCartItem } from '@/entities/cart'
import type { CartItem } from '@/shared/api'

export function CartTable({ items }: { items: CartItem[] }) {
  const updateItem = useUpdateCartItem()

  return (
    <div>
      <div className="grid grid-cols-[250px_77px_75px_87px_24px] items-center gap-[61px] border-b border-border pb-4 pr-6 text-base text-foreground">
        <span className="font-bold">NFTs</span>
        <span className="font-medium">Preço</span>
        <span className="font-bold">Edições</span>
        <span className="font-medium">Total</span>
        <span className="sr-only">Remover</span>
      </div>
      <div className="flex flex-col gap-3 pt-3">
        {items.map((item) => {
          const atLimit = item.quantity >= item.available
          const isRemoving =
            updateItem.isPending &&
            updateItem.variables?.nftId === item.nftId &&
            updateItem.variables?.editionId === item.editionId &&
            updateItem.variables?.quantity === 0
          return (
            <div
              key={`${item.nftId}-${item.editionId}`}
              className="grid h-[70px] grid-cols-[250px_77px_75px_87px_24px] items-center gap-[61px] bg-card pr-6"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl}
                  alt=""
                  width={70}
                  height={70}
                  className="rounded-xl object-cover"
                />
                <div>
                  <Text variant="body-bold">{item.name}</Text>
                  <Text variant="caption">ID do token: {item.tokenId}</Text>
                </div>
              </div>
              <Text variant="body">{formatEth(item.unitPrice)}</Text>
              <div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${item.name}`}
                    onClick={() =>
                      updateItem.mutate({
                        nftId: item.nftId,
                        editionId: item.editionId,
                        quantity: item.quantity - 1,
                      })
                    }
                    className="flex h-[30px] w-5 items-center justify-center rounded-[20px] border border-background bg-primary text-primary-foreground shadow-[0px_4px_6px_rgba(20,13,10,0.15)]"
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <span aria-live="polite" className="tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${item.name}`}
                    disabled={atLimit}
                    onClick={() =>
                      updateItem.mutate({
                        nftId: item.nftId,
                        editionId: item.editionId,
                        quantity: item.quantity + 1,
                      })
                    }
                    className="flex h-[30px] w-5 items-center justify-center rounded-[20px] border border-background bg-primary text-primary-foreground shadow-[0px_4px_6px_rgba(20,13,10,0.15)] disabled:opacity-40"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                {atLimit && (
                  <Text variant="caption" className="text-destructive mt-1">
                    Limite disponível atingido
                  </Text>
                )}
              </div>
              <Text variant="body-bold">{formatEth(mulEth(item.unitPrice, item.quantity))}</Text>
              <button
                type="button"
                aria-label={`Remover ${item.name} do carrinho`}
                disabled={isRemoving}
                onClick={() =>
                  updateItem.mutate(
                    { nftId: item.nftId, editionId: item.editionId, quantity: 0 },
                    { onSuccess: () => toast.success('Item removido do carrinho') },
                  )
                }
              >
                {isRemoving ? (
                  <Loader2
                    className="size-6 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="size-6 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
