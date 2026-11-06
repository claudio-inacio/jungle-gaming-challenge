import { AlertTriangle } from 'lucide-react'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/button'

export function CheckoutDeclinedState({
  declineReason,
  onRetry,
}: {
  declineReason: string | null
  onRetry: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <Text variant="body-bold" className="text-destructive">
        Pedido recusado
      </Text>
      <Text variant="body" className="max-w-sm text-muted-foreground">
        {declineReason ?? 'Não foi possível concluir o pagamento desta compra.'}
      </Text>
      <Button type="button" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}
