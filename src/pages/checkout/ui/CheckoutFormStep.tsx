import type { UseFormReturn } from 'react-hook-form'
import type { CartItem, CollectorProfile, Quote } from '@/shared/api'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { CollectorProfileForm } from '@/features/collector-profile'
import { WalletConnectPanel } from '@/features/connect-wallet'
import type { useConnectWallet } from '@/features/connect-wallet'
import { CheckoutItemsPanel } from './CheckoutItemsPanel'

export function CheckoutFormStep({
  form,
  items,
  quote,
  isQuoteLoading,
  isQuoteError,
  connectWallet,
  onAdvance,
  canAdvance,
}: {
  form: UseFormReturn<CollectorProfile>
  items: CartItem[]
  quote: Quote | null
  isQuoteLoading: boolean
  isQuoteError: boolean
  connectWallet: ReturnType<typeof useConnectWallet>
  onAdvance: () => void
  canAdvance: boolean
}) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <CollectorProfileForm form={form} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <CheckoutItemsPanel
          items={items}
          quote={quote}
          isQuoteLoading={isQuoteLoading}
          isQuoteError={isQuoteError}
        />

        <div className="flex flex-col gap-5">
          <Text variant="body-bold" className="text-base">
            Carteira e rede
          </Text>
          <WalletConnectPanel connectWallet={connectWallet} />
        </div>

        <Button
          type="button"
          onClick={onAdvance}
          disabled={!canAdvance}
          className="h-[45px] w-full rounded-lg"
          aria-describedby="checkout-advance-hint"
        >
          Avançar para revisão
        </Button>
        {!canAdvance && (
          <p id="checkout-advance-hint" className="text-xs text-muted-foreground">
            Preencha o perfil do colecionador e conecte uma carteira para continuar.
          </p>
        )}
      </div>
    </div>
  )
}
