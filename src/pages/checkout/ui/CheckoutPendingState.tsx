import { Loader2 } from 'lucide-react'
import { Text } from '@/shared/ui/Text'
import { OrderStatusAnnouncer } from '@/features/place-order'

export function CheckoutPendingState({ statusMessage }: { statusMessage: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <OrderStatusAnnouncer message={statusMessage} />
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <Text variant="body-bold">Pagamento em processamento</Text>
      <Text variant="body" className="max-w-sm text-muted-foreground">
        Aguardando a confirmação do pagamento. Isso pode levar alguns instantes — não é preciso
        recarregar a página.
      </Text>
    </div>
  )
}
