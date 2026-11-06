import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { formatEth } from '@/shared/lib/eth'
import { useSession } from '@/entities/session'
import { CouponInput } from '@/features/apply-coupon'
import { CartSummarySkeleton } from '@/shared/ui/CartSummarySkeleton'
import type { CartItem } from '@/shared/api'
import { quoteQuery } from '@/entities/quote'

export function CartSummary({
  items,
  couponCode,
}: {
  items: CartItem[]
  couponCode: string | null
}) {
  const { user, isAuthenticated } = useSession()
  const query = useQuery(quoteQuery({ items, couponCode, userId: user?.id }))

  if (query.isPending) return <CartSummarySkeleton />
  if (query.isError)
    return (
      <Text role="alert" className="text-destructive">
        Não foi possível calcular o total.
      </Text>
    )

  const quote = query.data

  return (
    // Desktop (11:1278): Resumo da carteira não tem card (sem borda/fundo/padding), 332px fixos.
    // Mobile (16:360): é um bottom sheet (fundo card, cantos superiores de 40px, sem borda).
    <aside className="flex flex-col gap-6 rounded-t-[40px] bg-card px-6 pt-6 pb-9 md:w-[var(--spacing-cart-summary-width)] md:shrink-0 md:rounded-none md:bg-transparent md:p-0">
      <div className="flex flex-col gap-3">
        <Text variant="heading" className="text-lg">
          Resumo da carteira
        </Text>
        <div aria-hidden="true" className="h-px w-full bg-border" />
      </div>
      <CouponInput appliedCode={quote.couponStatus === 'applied' ? quote.couponCode : null} />
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatEth(quote.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto do lançamento</dt>
          <dd>{quote.discount === '0' ? '(-) 0.00 ETH' : `(-) ${formatEth(quote.discount)}`}</dd>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <dt>Taxa de rede</dt>
            <dd>{formatEth(quote.networkFee)}</dd>
          </div>
          <span className="text-xs text-accent-foreground">Taxa estimada</span>
        </div>
      </dl>
      <div className="flex justify-between">
        <Text variant="body-bold">Total</Text>
        <Text variant="body-bold" className="text-accent-foreground">
          {formatEth(quote.total)}
        </Text>
      </div>
      <Button
        variant="pill"
        nativeButton={false}
        render={
          isAuthenticated ? (
            <Link to="/checkout" />
          ) : (
            <Link to="/login" search={{ redirect: '/checkout' }} />
          )
        }
      >
        {isAuthenticated ? 'Finalizar' : 'Conectar e finalizar'}
      </Button>
      <Button variant="ghost" nativeButton={false} render={<Link to="/" />}>
        Continuar explorando
      </Button>
    </aside>
  )
}
