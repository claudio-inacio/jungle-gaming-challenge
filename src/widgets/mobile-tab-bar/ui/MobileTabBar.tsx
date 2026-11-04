import { Link } from '@tanstack/react-router'
import { Heart, Home, ShoppingCart, Store, User } from 'lucide-react'
import { cn } from 'cn'

function MobileTabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="relative flex h-16 items-stretch justify-between px-2">
        <li className="flex flex-1">
          <Link
            to="/"
            aria-label="Início"
            activeProps={{ 'aria-current': 'page' }}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Home aria-hidden="true" className="size-5" />
          </Link>
        </li>

        <li className="flex flex-1">
          <button
            type="button"
            aria-label="Favoritos"
            disabled
            className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart aria-hidden="true" className="size-5" />
          </button>
        </li>

        <li className="flex flex-1 items-start justify-center">
          <button
            type="button"
            aria-label="Mercado"
            disabled
            className={cn(
              '-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-90',
            )}
          >
            <Store aria-hidden="true" className="size-6" />
          </button>
        </li>

        <li className="flex flex-1">
          <button
            type="button"
            aria-label="Carrinho"
            disabled
            className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart aria-hidden="true" className="size-5" />
          </button>
        </li>

        <li className="flex flex-1">
          <button
            type="button"
            aria-label="Perfil"
            disabled
            className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <User aria-hidden="true" className="size-5" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export { MobileTabBar }
