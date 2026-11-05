import { Heart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSession } from '@/entities/session'
import { useToggleFavorite } from '../api/toggle-favorite'
import { cn } from '@/shared/lib/utils'

export function FavoriteButton({ nftId, isFavorited }: { nftId: string; isFavorited: boolean }) {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorited}
      aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className="rounded-full bg-card/80 p-2 backdrop-blur"
    >
      <Heart
        className={cn('size-5', isFavorited && 'fill-accent-foreground text-accent-foreground')}
        aria-hidden="true"
      />
    </button>
  )
}
