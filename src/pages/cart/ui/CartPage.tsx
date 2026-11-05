import { useQuery } from '@tanstack/react-query'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { useSession } from '@/entities/session'
import { cartQuery, useGuestCartItems, useCartRealtime } from '@/entities/cart'
import { useMediaQuery } from '@/shared/lib/hooks'
import { EmptyState } from '@/shared/ui/QueryState'
import { CartSummarySkeleton } from '@/shared/ui/CartSummarySkeleton'
import { Skeleton } from '@/shared/ui/skeleton'
import { CartTable, CartItemMobile } from '@/widgets/cart-table'
import { CartSummary } from '@/widgets/cart-summary'

export function CartPage() {
  const { user, isAuthenticated } = useSession()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const serverCart = useQuery({ ...cartQuery(user?.id ?? ''), enabled: isAuthenticated })
  const guestCart = useGuestCartItems({ enabled: !isAuthenticated })

  const isPending = isAuthenticated ? serverCart.isPending : guestCart.isPending
  const items = isAuthenticated ? (serverCart.data?.items ?? []) : guestCart.items
  useCartRealtime(items.map((item) => item.nftId))

  if (isPending) {
    return (
      <main className="flex flex-col gap-7">
        <div className="flex flex-col gap-5 md:flex-row md:gap-[86px]">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-80 w-full" />
          </div>
          <CartSummarySkeleton />
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main>
        <EmptyState
          title="Seu carrinho está vazio"
          description="Explore o catálogo e encontre seu próximo NFT."
        />
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-7">
      {isDesktop && (
        <Breadcrumb
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/' },
            { label: 'Carrinho' },
          ]}
        />
      )}
      <div className="flex flex-col gap-5 md:flex-row md:gap-[86px]">
        <div className="min-w-0 flex-1 overflow-x-auto">
          {isDesktop ? (
            <CartTable items={items} />
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <CartItemMobile key={`${item.nftId}-${item.editionId}`} item={item} />
              ))}
            </div>
          )}
        </div>
        <CartSummary
          items={items}
          couponCode={isAuthenticated ? (serverCart.data?.couponCode ?? null) : null}
        />
      </div>
    </main>
  )
}
