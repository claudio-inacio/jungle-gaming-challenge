import { Loader2 } from 'lucide-react'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'
import { formatEth } from '@/shared/lib/eth'
import type { CartItem, CollectorProfile, Quote, Wallet } from '@/shared/api'
import { CheckoutItemsPanel } from './CheckoutItemsPanel'

const NETWORK_LABELS: Record<string, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export function CheckoutReviewStep({
  profile,
  connectedWallet,
  items,
  quote,
  isQuoteLoading,
  isQuoteError,
  quoteChanged,
  confirmError,
  onAcceptNewQuote,
  onConfirm,
  onBack,
  isConfirmDisabled,
  isConfirming,
}: {
  profile: CollectorProfile
  connectedWallet: Wallet | null
  items: CartItem[]
  quote: Quote | null
  isQuoteLoading: boolean
  isQuoteError: boolean
  quoteChanged: boolean
  confirmError: string | null
  onAcceptNewQuote: () => void
  onConfirm: () => void
  onBack: () => void
  isConfirmDisabled: boolean
  isConfirming: boolean
}) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-[763px]">
        <Text variant="body-bold" className="text-base">
          Revisão do pedido
        </Text>

        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nome de exibição</dt>
            <dd>{profile.displayName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nome de usuário</dt>
            <dd>{profile.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Rede</dt>
            <dd>
              {connectedWallet
                ? (NETWORK_LABELS[connectedWallet.network] ?? connectedWallet.network)
                : 'Nenhuma carteira conectada'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Carteira</dt>
            <dd>{connectedWallet ? connectedWallet.address : 'Nenhuma carteira conectada'}</dd>
          </div>
          {profile.referralCode && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Código de indicação</dt>
              <dd>{profile.referralCode}</dd>
            </div>
          )}
        </dl>

        {quoteChanged && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-md border border-primary bg-card p-4"
          >
            <Text variant="body-bold">A cotação deste pedido foi atualizada.</Text>
            {quote && <Text variant="body">Novo total: {formatEth(quote.total)}</Text>}
            <Button type="button" onClick={onAcceptNewQuote} className="w-fit">
              Aceitar novo valor
            </Button>
          </div>
        )}

        {confirmError && !quoteChanged && (
          <Text role="alert" className="text-destructive">
            {confirmError}
          </Text>
        )}

        <Button type="button" variant="ghost" onClick={onBack} className="w-fit">
          Voltar e editar
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <CheckoutItemsPanel
          items={items}
          quote={quote}
          isQuoteLoading={isQuoteLoading}
          isQuoteError={isQuoteError}
        />

        <Button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="h-[45px] w-full rounded-lg"
          aria-busy={isConfirming}
        >
          {isConfirming ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Confirmando
            </>
          ) : (
            'Confirmar compra'
          )}
        </Button>
      </div>
    </div>
  )
}
