import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Text } from '@/shared/ui/Text'

type Props = {
  average: number
  count: number
  className?: string
}

export function StarRating({ average, count, className }: Props) {
  const rounded = Math.round(average)

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="img"
      aria-label={`${average.toFixed(1)} de 5 estrelas, ${count} avaliações de colecionadores`}
    >
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
