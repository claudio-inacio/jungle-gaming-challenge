import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function EmptyState({
  title,
  description,
  icon = <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />,
}: {
  title: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
      {icon}
      <p className="font-bold">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  )
}

export function ErrorState({
  title = 'Algo deu errado',
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <p className="font-bold">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      <Button onClick={onRetry} variant="outline">
        Tentar novamente
      </Button>
    </div>
  )
}
