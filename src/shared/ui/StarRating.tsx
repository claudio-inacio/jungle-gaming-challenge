import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Text } from '@/shared/ui/Text'

type Props = {
  average: number
  count: number
  className?: string
  variant?: 'default' | 'compact'
}

export function StarRating({ average, count, className, variant = 'default' }: Props) {
  const label = `${average.toFixed(1)} de 5 estrelas, ${count} avaliações de colecionadores`

  if (variant === 'compact') {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-3 py-1',
          className,
        )}
      >
        <Star aria-hidden="true" className="size-3.5 fill-primary text-primary" />
        <Text variant="body-bold" className="text-foreground">
          {average.toFixed(1)}
        </Text>
        <Text variant="caption">({count})</Text>
      </div>
    )
  }

  const rounded = Math.round(average)

  return (
    <div className={cn('flex items-center gap-1.5', className)} role="img" aria-label={label}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              'size-4',
              index < rounded ? 'fill-primary text-primary' : 'text-muted-foreground',
            )}
          />
        ))}
      </div>
      <Text variant="caption">
        {average.toFixed(1)} ({count} avaliações de colecionadores)
      </Text>
    </div>
  )
}
