import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { NftEdition } from '@/shared/api'

type Props = {
  editions: NftEdition[]
  selectedId: string
  onSelect: (id: string) => void
}

export function EditionChips({ editions, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {editions.map((e) => {
        const isSelected = e.id === selectedId
        return (
          <button
            key={e.id}
            type="button"
            disabled={e.available === 0}
            aria-pressed={isSelected}
            onClick={() => onSelect(e.id)}
            className="rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Badge
              variant="edition"
              className={cn(
                'border-2',
                isSelected
                  ? 'border-primary font-extrabold underline decoration-2 underline-offset-2'
                  : 'border-border-soft',
              )}
            >
              {e.label === 'open' ? 'ABERTA' : e.label}
              {e.available === 0 && ' · esgotada'}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
