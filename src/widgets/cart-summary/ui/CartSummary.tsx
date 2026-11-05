import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { formatEth } from '@/shared/lib/eth'
import { useSession } from '@/entities/session'
import { CouponInput } from '@/features/apply-coupon/ui/CouponInput'
import { CartSummarySkeleton } from '@/shared/ui/CartSummarySkeleton' // criado na Fase 2
import type { CartItem } from '@/shared/api/contracts/cart'
import { quoteQuery } from '@/entities/quote/api/quote'

export function CartSummary({
  items,
  couponCode,
}: {
  items: CartItem[]
  couponCode: string | null
}) {
  const { user } = useSession()
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
    <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <Text variant="heading">Resumo da carteira</Text>
      <CouponInput appliedCode={quote.couponStatus === 'applied' ? quote.couponCode : null} />
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatEth(quote.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto do lançamento</dt>
          <dd>{quote.discount === '0' ? '(-) 0.00 ETH' : `(-) ${formatEth(quote.discount)}`}</dd>
        </div>
        <div className="flex justify-between">
          <dt>
            Taxa de rede <span className="text-muted-foreground">(Taxa estimada)</span>
          </dt>
          <dd>{formatEth(quote.networkFee)}</dd>
        </div>
      </dl>
      <div className="flex justify-between border-t border-border pt-4">
        <Text variant="body-bold">Total</Text>
        <Text variant="body-bold" className="text-accent-foreground">
          {formatEth(quote.total)}
        </Text>
      </div>
      <OutOfScopeButton variant="pill">Conectar e finalizar</OutOfScopeButton>
      <Button variant="ghost" nativeButton={false} render={<Link to="/" />}>
        Continuar explorando
      </Button>
    </aside>
  )
}
