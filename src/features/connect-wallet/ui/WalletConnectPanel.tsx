import { Loader2 } from 'lucide-react'
import type { useConnectWallet } from '../model/useConnectWallet'
import { NoWalletsNotice } from './NoWalletsNotice'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { Network, WalletProvider, WalletType } from '@/shared/api'

const PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  wallet_connect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  primary: 'Principal',
  secondary: 'Reserva',
}

const NETWORK_LABELS: Record<Network, string> = {
  ethereum: 'Rede principal Ethereum',
  polygon: 'Rede Polygon',
  solana: 'Rede Solana',
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

type ConnectWalletState = ReturnType<typeof useConnectWallet>

export function WalletConnectPanel({ connectWallet }: { connectWallet: ConnectWalletState }) {
  const {
    status,
    wallets,
    hasNoWallets,
    isLoadingWallets,
    walletsError,
    connectedWallet,
    pendingWalletId,
    connect,
    refuse,
    disconnect,
  } = connectWallet

  if (isLoadingWallets) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-[45px] w-full rounded-[3px]" />
        <Skeleton className="h-[45px] w-full rounded-[3px]" />
      </div>
    )
  }

  if (walletsError) {
    return (
      <Text role="alert" className="text-destructive">
        Não foi possível carregar suas carteiras.
      </Text>
    )
  }

  if (hasNoWallets) {
    return <NoWalletsNotice />
  }

  return (
    <div className="flex flex-col gap-4">
      <span
        aria-hidden="true"
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
      >
        <span className="size-4 rounded-full border border-current" />
        Supported wallet brands
      </span>

      {status === 'connected' && connectedWallet && (
        <div className="flex items-center justify-between text-sm">
          <Text variant="body-bold" className="text-accent-foreground">
            Carteira conectada
          </Text>
          <button
            type="button"
            onClick={disconnect}
            className="font-bold text-accent-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Trocar carteira
          </button>
        </div>
      )}

      <div role="group" aria-label="Carteiras cadastradas" className="flex flex-col gap-4">
        {wallets.map((wallet) => {
          const isSelected = connectedWallet?.id === wallet.id
          const isConnectingThis = status === 'connecting' && pendingWalletId === wallet.id

          return (
            <div
              key={wallet.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-[15px] bg-card px-4 py-3 shadow-[0px_20px_20px_rgba(10,6,4,0.45)] lg:h-[45px] lg:rounded-[3px] lg:border lg:border-input lg:bg-transparent lg:px-4 lg:shadow-none',
                isSelected && 'lg:border-primary',
              )}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={status === 'connecting'}
                onClick={() => connect(wallet.id)}
                className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative flex size-4 shrink-0 items-center justify-center rounded-full border',
                    isSelected ? 'border-primary' : 'border-input',
                  )}
                >
                  {isSelected && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
                <span className="flex flex-col">
                  <Text variant="body-bold" className="text-sm">
                    {PROVIDER_LABELS[wallet.provider]}
                  </Text>
                  <Text variant="caption">
                    {WALLET_TYPE_LABELS[wallet.type]} ·{' '}
                    {wallet.ensName ?? shortenAddress(wallet.address)} ·{' '}
                    {NETWORK_LABELS[wallet.network]}
                  </Text>
                </span>
              </button>
              {isConnectingThis && (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={refuse}
                    className="text-xs font-medium underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    Cancelar
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
