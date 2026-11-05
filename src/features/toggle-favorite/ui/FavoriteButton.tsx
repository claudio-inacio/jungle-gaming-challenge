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
        className={className}
      >
        <Heart
          className={cn('size-4', isFavorited && 'fill-accent-foreground text-accent-foreground')}
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
      className={cn('rounded-full bg-card/80 p-2 backdrop-blur', className)}
    >
      <Heart
        className={cn('size-5', isFavorited && 'fill-accent-foreground text-accent-foreground')}
        aria-hidden="true"
      />
    </button>
  )
}
