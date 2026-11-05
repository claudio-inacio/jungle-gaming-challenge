import { Heart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSession } from '@/entities/session'
import { useToggleFavorite } from '../api/toggle-favorite'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

type Props = {
  nftId: string
  isFavorited: boolean
  className?: string
  variant?: 'icon' | 'button'
}

export function FavoriteButton({ nftId, isFavorited, className, variant = 'icon' }: Props) {
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()
  const toggle = useToggleFavorite()

  function handleClick() {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: location.pathname } })
      return
    }
    toggle.mutate({ nftId, nextValue: !isFavorited })
  }

  const label = isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        aria-pressed={isFavorited}
        className={cn(
          'h-10 w-[130px] gap-2 rounded-md border-primary text-accent-foreground hover:bg-accent/20',
          className,
        )}
      >
        <Heart
          className={cn('size-4', isFavorited && 'fill-accent-foreground')}
          aria-hidden="true"
        />
        {isFavorited ? 'Favoritado' : 'Favoritar'}
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorited}
      aria-label={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      <Heart
        className={cn('size-4', isFavorited && 'fill-accent-foreground text-accent-foreground')}
        aria-hidden="true"
      />
    </button>
  )
}
