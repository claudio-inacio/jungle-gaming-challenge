import { CheckCircle2 } from 'lucide-react'
import { notFound, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/QueryState'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { formatEth } from '@/shared/lib/eth'
import { ApiError } from '@/shared/api'
import { useSession } from '@/entities/session'
import { orderDetailQuery } from '@/entities/order'

const EDITION_LABELS: Record<string, string> = {
  '1/1': '1/1',
  '1/10': '1/10',
  '1/50': '1/50',
  open: 'ABERTA',
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(isoDate),
  )
}

export function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/_authenticated/orders/$orderId' })
  const { user } = useSession()
  const query = useQuery(orderDetailQuery(user?.id, orderId))

  if (query.isPending) {
    return (
      <main className="flex flex-col gap-7">
        <Skeleton className="mx-auto h-[600px] w-full max-w-[578px]" aria-hidden="true" />
      </main>
    )
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.code === 'NOT_FOUND') {
      throw notFound()
    }
    return (
      <main>
        <ErrorState description="Não foi possível carregar este pedido." onRetry={query.refetch} />
      </main>
    )
  }

  const order = query.data

  if (order.status === 'pending') {
    return (
      <main className="flex flex-col items-center gap-4 py-24 text-center">
        <Text variant="body-bold">Pagamento em processamento</Text>
        <Text variant="body" className="max-w-sm text-muted-foreground">
          Este pedido ainda está sendo confirmado. Atualize a página em alguns instantes.
        </Text>
      </main>
    )
  }

  if (order.status === 'declined') {
    return (
      <main className="flex flex-col items-center gap-4 py-24 text-center">
        <Text variant="body-bold" className="text-destructive">
          Pedido recusado
        </Text>
        <Text variant="body" className="max-w-sm text-muted-foreground">
          {order.declineReason ?? 'Não foi possível concluir o pagamento desta compra.'}
        </Text>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-7 px-6 md:px-0">
      <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Pedido confirmado' }]} />

      <div className="mx-auto flex w-full max-w-[578px] flex-col">
        <div className="flex flex-col items-center gap-4 py-5 text-center">
          <CheckCircle2 className="size-20 text-primary" aria-hidden="true" />
          <Text variant="body-bold" className="text-base">
            Seus NFTs agora estão na sua carteira
          </Text>
        </div>

        <div aria-hidden="true" className="h-px w-full bg-primary" />

        <dl className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:divide-border sm:px-9">
          <div className="flex flex-col gap-1 sm:px-4 sm:first:pl-0">
            <dt className="text-sm font-bold text-muted-foreground">ID da transação</dt>
            <dd className="text-[15px]">{order.transactionId}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:px-4">
            <dt className="text-sm font-bold text-muted-foreground">Data</dt>
            <dd className="text-[15px]">
              {order.confirmedAt ? formatDate(order.confirmedAt) : '—'}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:px-4">
            <dt className="text-sm font-bold text-muted-foreground">Total</dt>
            <dd className="text-[15px]">{formatEth(order.total)}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:px-4 sm:last:pr-0">
            <dt className="text-sm font-bold text-muted-foreground">Carteira</dt>
            <dd className="text-[15px]">{shortenAddress(order.walletAddress)}</dd>
          </div>
        </dl>

        <div aria-hidden="true" className="h-px w-full bg-primary" />

        <div className="flex flex-col gap-3 pt-5 pb-5 sm:px-11 sm:pb-12">
          <Text variant="body-bold" className="text-[15px]">
            Detalhes da transação
          </Text>

          <div className="flex items-center justify-between pr-4 pl-1 text-base font-medium">
            <span>NFTs</span>
            <div className="flex gap-12">
              <span>Edições</span>
              <span>Subtotal</span>
            </div>
          </div>
          <div aria-hidden="true" className="h-px w-full bg-border" />

          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li
                key={`${item.nftId}-${item.editionId}`}
                className="flex min-h-[70px] flex-col gap-3 bg-card px-1 py-3 sm:h-[70px] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0 sm:pr-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={item.image}
                    alt=""
                    width={70}
                    height={70}
                    className="size-[70px] shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <Text variant="body-bold" className="truncate">
                      {item.name}
                    </Text>
                    <Text variant="caption" className="truncate text-brand-secondary">
                      ID do token: {item.tokenId}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-12">
                  <Text variant="body" className="whitespace-nowrap">
                    {EDITION_LABELS[item.editionLabel] ?? item.editionLabel} (x{item.quantity})
                  </Text>
                  <Text variant="body-bold" className="whitespace-nowrap text-accent-foreground">
                    {formatEth(item.subtotal)}
                  </Text>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex w-full max-w-[321px] flex-col gap-3 self-end">
            <div className="flex justify-between text-[15px]">
              <span>Taxa de rede</span>
              <span>{formatEth(order.networkFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-lg text-accent-foreground">{formatEth(order.total)}</span>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="h-px w-full bg-primary" />

        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <Text variant="body" className="max-w-sm text-muted-foreground">
            Esta é uma simulação do marketplace Kurio. Nenhuma transação real foi enviada a uma
            blockchain.
          </Text>
          <OutOfScopeButton className="w-full rounded-lg sm:w-auto" size="lg">
            Ver no Etherscan
          </OutOfScopeButton>
        </div>

        <div aria-hidden="true" className="h-[10px] w-full bg-primary" />
      </div>
    </main>
  )
}
