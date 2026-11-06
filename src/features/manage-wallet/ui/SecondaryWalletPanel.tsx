import { useState } from 'react'
import { toast } from 'sonner'
import type { Wallet } from '@/shared/api'
import { Text } from '@/shared/ui/Text'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { useDeleteWalletMutation } from '../api/wallets'
import { WalletForm } from './WalletForm'
import { RemoveSecondaryDialog } from './RemoveSecondaryDialog'

const PROVIDER_LABELS: Record<Wallet['provider'], string> = {
  metamask: 'MetaMask',
  wallet_connect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

const NETWORK_LABELS: Record<Wallet['network'], string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

function ReadOnlyMirror({ wallet }: { wallet: Wallet }) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-muted-foreground">Apelido</dt>
        <dd className="min-w-0 truncate text-right text-foreground">{wallet.label ?? '—'}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-muted-foreground">Provedor</dt>
        <dd className="min-w-0 truncate text-right text-foreground">
          {PROVIDER_LABELS[wallet.provider]}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-muted-foreground">Rede</dt>
        <dd className="min-w-0 truncate text-right text-foreground">
          {NETWORK_LABELS[wallet.network]}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-muted-foreground">Endereço</dt>
        <dd className="min-w-0 truncate text-right text-foreground">{wallet.address}</dd>
      </div>
      {wallet.ensName && (
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-muted-foreground">ENS</dt>
          <dd className="min-w-0 truncate text-right text-foreground">{wallet.ensName}</dd>
        </div>
      )}
    </dl>
  )
}

export function SecondaryWalletPanel({
  userId,
  primaryWallet,
  secondaryWallet,
}: {
  userId: string | undefined
  primaryWallet: Wallet | null
  secondaryWallet: Wallet | null
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const deleteMutation = useDeleteWalletMutation(userId)

  if (!primaryWallet) {
    return (
      <div className="flex flex-col gap-3">
        <Text variant="body-bold" className="text-base">
          Carteira secundária
        </Text>
        <Text variant="caption" className="text-muted-foreground">
          Cadastre uma carteira principal antes de adicionar uma carteira secundária.
        </Text>
      </div>
    )
  }

  const isMirrored = !secondaryWallet && !isCreating

  function handleToggleMirror(checked: boolean) {
    if (checked && secondaryWallet) {
      setIsRemoveDialogOpen(true)
      return
    }
    if (checked && !secondaryWallet) {
      setIsCreating(false)
      return
    }
    if (!checked) setIsCreating(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text as="h3" variant="body-bold" className="text-[17px]">
          Carteira secundária
        </Text>

        <div className="flex items-center gap-2">
          <Checkbox
            id="mirror-primary-wallet"
            checked={isMirrored}
            disabled={deleteMutation.isPending}
            onCheckedChange={(checked) => handleToggleMirror(checked === true)}
            className="size-4 rounded-full"
          />
          <Label htmlFor="mirror-primary-wallet" className="text-sm">
            Igual à carteira principal
          </Label>

          {isMirrored && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="text-base font-medium text-accent-foreground outline-none hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Adicionar
            </button>
          )}
        </div>
      </div>

      {isMirrored && (
        <>
          <Text variant="caption" className="text-muted-foreground">
            Você ainda não adicionou uma carteira secundária.
          </Text>
          <ReadOnlyMirror wallet={primaryWallet} />
        </>
      )}

      {!isMirrored && !secondaryWallet && (
        <WalletForm
          type="secondary"
          userId={userId}
          submitLabel="Cadastrar carteira secundária"
          onSuccess={() => setIsCreating(false)}
        />
      )}

      {!isMirrored && secondaryWallet && (
        <WalletForm
          type="secondary"
          wallet={secondaryWallet}
          userId={userId}
          submitLabel="Salvar carteira secundária"
        />
      )}

      <RemoveSecondaryDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        onConfirm={() => {
          if (!secondaryWallet) return
          deleteMutation.mutate(secondaryWallet.id, {
            onSuccess: () => {
              setIsRemoveDialogOpen(false)
              setIsCreating(false)
              toast.success('Carteira secundária removida.')
            },
            onError: () => {
              toast.error('Não foi possível remover a carteira secundária.')
            },
          })
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
