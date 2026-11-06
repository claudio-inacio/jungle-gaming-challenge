import { Loader2 } from 'lucide-react'
import { Text } from '@/shared/ui/Text'

export function CheckoutProcessing({ message }: { message: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <Text variant="body-bold">{message}</Text>
    </div>
  )
}
