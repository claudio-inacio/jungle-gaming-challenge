import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Text } from '@/shared/ui/Text'
import { formatEth } from '@/shared/lib/eth'
import { useUpdateCartItem } from '@/entities/cart'
import type { CartItem } from '@/shared/api'

export function CartItemMobile({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem()
  const isRemoving =
    updateItem.isPending &&
    updateItem.variables?.nftId === item.nftId &&
    updateItem.variables?.editionId === item.editionId &&
    updateItem.variables?.quantity === 0
  return (
    <div className="flex gap-2 items-start">
      {' '}
      {/* imagem→texto ~8px no Figma mobile */}
      <img
        src={item.imageUrl}
        alt=""
        width={100}
        height={100}
        className="rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 flex flex-col gap-1 pt-1">
        <Text variant="body-bold">{item.name}</Text>
        <Text variant="caption">
          Edição: {item.editionLabel === 'open' ? 'ABERTA' : item.editionLabel}
        </Text>
        <Text variant="body" className="text-accent-foreground">
          {formatEth(item.unitPrice)}
        </Text>
      </div>
      <div className="flex items-center gap-3 pt-6">
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
          className="flex size-6 items-center justify-center rounded-full border border-border bg-surface-raised"
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <span aria-live="polite" className="tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${item.name}`}
          disabled={item.quantity >= item.available}
          onClick={() =>
            updateItem.mutate({
              nftId: item.nftId,
              editionId: item.editionId,
              quantity: item.quantity + 1,
            })
          }
          className="flex size-6 items-center justify-center rounded-full border border-border bg-surface-raised disabled:opacity-40"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {/* Confirmado no Figma (node 16:360): no item 3 o ícone de lixeira está sobreposto ao
          botão "+", um erro de edição do arquivo, não um estado desenhado — por isso mantemos
          +/- e remover explícitos e acessíveis em todos os itens, igual ao padrão dos demais. */}
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
        className="pt-6"
      >
        {isRemoving ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <Trash2 className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
