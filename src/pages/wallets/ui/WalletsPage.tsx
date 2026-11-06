import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/entities/session'
import { walletsQuery, selectPrimaryWallet, selectSecondaryWallet } from '@/entities/wallet'
import { AccountSidebar } from '@/widgets/account-sidebar'
import { WalletForm, SecondaryWalletPanel } from '@/features/manage-wallet'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { ErrorState } from '@/shared/ui/QueryState'
import { Text } from '@/shared/ui/Text'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { WalletsPageSkeleton } from './WalletsPageSkeleton'

const MOBILE_CARD_CLASSNAME =
  'rounded-[14px] bg-card p-4 shadow-[0px_20px_20px_rgba(10,6,4,0.45)] lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none'

export function WalletsPage() {
  const { user } = useSession()
  const walletsResult = useQuery(walletsQuery(user?.id))
  const wallets = walletsResult.data ?? []
  const primaryWallet = selectPrimaryWallet(wallets)
  const secondaryWallet = selectSecondaryWallet(wallets)

  return (
    <main className="flex flex-col gap-7 px-4 md:px-0">
      <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Carteiras' }]} />

      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {walletsResult.isPending ? (
            <WalletsPageSkeleton />
          ) : walletsResult.isError ? (
            <ErrorState
              description="Não foi possível carregar suas carteiras."
              onRetry={() => walletsResult.refetch()}
            />
          ) : (
            <>
              <div className={cn('flex flex-col gap-4', MOBILE_CARD_CLASSNAME)}>
                <Text variant="body-bold" className="text-base">
                  Carteira principal
                </Text>
                <WalletForm
                  type="primary"
                  wallet={primaryWallet ?? undefined}
                  userId={user?.id}
                  submitLabel={
                    primaryWallet ? 'Salvar carteira principal' : 'Cadastrar carteira principal'
                  }
                />
              </div>

              <Separator className="hidden lg:block" />

              <div className={MOBILE_CARD_CLASSNAME}>
                <SecondaryWalletPanel
                  userId={user?.id}
                  primaryWallet={primaryWallet}
                  secondaryWallet={secondaryWallet}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
