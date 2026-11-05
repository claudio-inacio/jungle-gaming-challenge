import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/entities/session'

import { EmptyState } from '@/shared/ui/QueryState'
import { CartSummarySkeleton } from '@/shared/ui/CartSummarySkeleton'
import { Skeleton } from '@/shared/ui/skeleton'
import { CartTable } from '@/widgets/cart-table'
import { CartSummary } from '@/widgets/cart-summary'
import { cartQuery, useGuestCartItems, useCartRealtime } from '@/entities/cart'

export function CartPage() {
  const { user, isAuthenticated } = useSession()

  const serverCart = useQuery({ ...cartQuery(user?.id ?? ''), enabled: isAuthenticated })
  const guestCart = useGuestCartItems()

  const isPending = isAuthenticated ? serverCart.isPending : guestCart.isPending
  const items = isAuthenticated ? (serverCart.data?.items ?? []) : guestCart.items
  useCartRealtime(items.map((i) => i.nftId))

  if (isPending) {
    return (
      <main className="flex gap-10">
        <div className="flex-1">
          <Skeleton className="h-80 w-full" />
        </div>
        <CartSummarySkeleton />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        description="Explore o catálogo e encontre seu próximo NFT."
      />
    )
  }

  return (
    <main className="flex gap-10">
      <div className="flex-1">
        <CartTable items={items} />
      </div>
      <CartSummary
        items={items}
        couponCode={isAuthenticated ? (serverCart.data?.couponCode ?? null) : null}
      />
    </main>
  )
}
