import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Props = {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  canIncrement: boolean
  canDecrement: boolean
  size?: 'default' | 'compact'
  className?: string
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
  size = 'default',
  className,
}: Props) {
  const isCompact = size === 'compact'
  const circleClass = isCompact ? 'size-5' : 'size-9'
  const iconClass = isCompact ? 'size-3' : 'size-4'
  const gapClass = isCompact ? 'gap-2' : 'gap-3'
  const numberClass = isCompact ? 'text-sm' : 'text-lg'

  return (
    <div
      role="group"
      aria-label="Quantidade"
      className={cn('flex items-center', gapClass, className)}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label="Diminuir quantidade"
        className={cn(
          circleClass,
          'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm outline-none transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <Minus aria-hidden="true" className={iconClass} />
      </button>
      <span aria-live="polite" className={cn(numberClass, 'tabular-nums text-foreground')}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-label="Aumentar quantidade"
        className={cn(
          circleClass,
          'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm outline-none transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <Plus aria-hidden="true" className={iconClass} />
      </button>
    </div>
  )
}
