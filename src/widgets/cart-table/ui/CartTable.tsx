import { Trash2 } from 'lucide-react'
import { Text } from '@/shared/ui/Text'
import { formatEth, mulEth } from '@/shared/lib/eth'

import type { CartItem } from '@/shared/api/contracts/cart'
import { useUpdateCartItem } from '@/entities/cart/model/api/cart'

export function CartTable({ items }: { items: CartItem[] }) {
  const updateItem = useUpdateCartItem()

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground text-sm">
          <th className="py-3 font-normal" scope="col">
            NFT
          </th>
          <th className="py-3 font-normal" scope="col">
            Preço
          </th>
          <th className="py-3 font-normal" scope="col">
            Edições
          </th>
          <th className="py-3 font-normal text-right" scope="col">
            Total
          </th>
          <th className="py-3" scope="col">
            <span className="sr-only">Remover</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const atLimit = item.quantity >= item.available
          return (
            <tr key={`${item.nftId}-${item.editionId}`} className="border-b border-border/60">
              <td className="py-4 flex items-center gap-3">
                <img
                  src={item.image}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-lg object-cover"
                />
                <div>
                  <Text variant="body-bold">{item.name}</Text>
                  <Text variant="caption">ID do token: #{item.tokenId}</Text>
                </div>
              </td>
              <td>
                <Text variant="body">{formatEth(item.unitPrice)}</Text>
              </td>
              <td>
                <div className="flex items-center border border-border rounded-full w-fit">
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
                    className="px-3 py-1"
                  >
                    −
                  </button>
                  <span aria-live="polite" className="px-2 tabular-nums">
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
                    className="px-3 py-1 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                {atLimit && (
                  <Text variant="caption" className="text-destructive mt-1">
                    Limite disponível atingido
                  </Text>
                )}
              </td>
              <td className="text-right">
                <Text variant="body-bold">{formatEth(mulEth(item.unitPrice, item.quantity))}</Text>
              </td>
              <td>
                <button
                  type="button"
                  aria-label={`Remover ${item.name} do carrinho`}
                  onClick={() =>
                    updateItem.mutate({ nftId: item.nftId, editionId: item.editionId, quantity: 0 })
                  }
                >
                  <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
