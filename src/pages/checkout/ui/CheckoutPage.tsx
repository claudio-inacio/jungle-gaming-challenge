import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { EmptyState } from '@/shared/ui/QueryState'
import { useMediaQuery } from '@/shared/lib/hooks'
import { useSession } from '@/entities/session'
import { cartQuery, useCartRealtime } from '@/entities/cart'
import { useCheckout } from '@/features/place-order'
import { useConnectWallet } from '@/features/connect-wallet'
import { useCollectorProfileForm } from '@/features/collector-profile'
import { CheckoutFormStep } from './CheckoutFormStep'
import { CheckoutReviewStep } from './CheckoutReviewStep'
import { CheckoutProcessing } from './CheckoutProcessing'
import { CheckoutPendingState } from './CheckoutPendingState'
import { CheckoutDeclinedState } from './CheckoutDeclinedState'
import { CheckoutSkeleton } from './CheckoutSkeleton'

export function CheckoutPage() {
  const { user } = useSession()
  const userId = user?.id ?? ''
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const cartResult = useQuery({ ...cartQuery(userId), enabled: Boolean(userId) })
  const items = cartResult.data?.items ?? []
  const couponCode = cartResult.data?.couponCode ?? null
  useCartRealtime(items.map((item) => item.nftId))

  const connectWallet = useConnectWallet()
  const connectedWallet = connectWallet.connectedWallet
  const profileForm = useCollectorProfileForm(user, connectedWallet)

  const checkout = useCheckout({
    items,
    couponCode,
    walletAddress: connectedWallet?.address ?? null,
    network: connectedWallet?.network ?? null,
  })

  useEffect(() => {
    if (checkout.step === 'confirmed' && checkout.order) {
      navigate({ to: '/orders/$orderId', params: { orderId: checkout.order.id } })
    }
  }, [checkout.step, checkout.order, navigate])

  if (checkout.isRecoveringOrder || cartResult.isPending) {
    return (
      <main className="flex flex-col gap-7">
        <CheckoutSkeleton />
      </main>
    )
  }

  if (items.length === 0 && checkout.step === 'form') {
    return (
      <main>
        <EmptyState
          title="Seu carrinho está vazio"
          description="Adicione NFTs ao carrinho antes de finalizar uma compra."
        />
      </main>
    )
  }

  const canAdvance = profileForm.formState.isValid && connectWallet.status === 'connected'

  return (
    <main className="flex flex-col gap-7">
      {isDesktop && (
        <Breadcrumb
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/' },
            { label: 'Pagamento' },
          ]}
        />
      )}

      {checkout.step === 'form' && (
        <CheckoutFormStep
          form={profileForm}
          items={items}
          quote={checkout.quote}
          isQuoteLoading={checkout.isQuoteLoading}
          isQuoteError={Boolean(checkout.quoteError)}
          connectWallet={connectWallet}
          onAdvance={checkout.enterReview}
          canAdvance={canAdvance}
        />
      )}

      {checkout.step === 'review' && (
        <CheckoutReviewStep
          profile={profileForm.getValues()}
          connectedWallet={connectedWallet}
          items={items}
          quote={checkout.quote}
          isQuoteLoading={checkout.isQuoteLoading}
          isQuoteError={Boolean(checkout.quoteError)}
          quoteChanged={checkout.quoteChanged}
          confirmError={checkout.confirmError}
          onAcceptNewQuote={checkout.acceptNewQuote}
          onConfirm={checkout.confirm}
          onBack={checkout.cancel}
          isConfirmDisabled={checkout.isConfirmDisabled}
          isConfirming={false}
        />
      )}

      {checkout.step === 'revalidating-quote' && (
        <CheckoutProcessing message="Revalidando valores antes de confirmar o pedido." />
      )}

      {checkout.step === 'confirming' && <CheckoutProcessing message="Enviando seu pedido." />}

      {checkout.step === 'pending' && (
        <CheckoutPendingState statusMessage={checkout.statusMessage} />
      )}

      {checkout.step === 'declined' && (
        <CheckoutDeclinedState
          declineReason={checkout.order?.declineReason ?? null}
          onRetry={checkout.cancel}
        />
      )}

      {checkout.step === 'confirmed' && (
        <CheckoutProcessing message="Pedido confirmado. Redirecionando…" />
      )}
    </main>
  )
}
