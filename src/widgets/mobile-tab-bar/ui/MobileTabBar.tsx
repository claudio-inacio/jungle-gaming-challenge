import { Link } from '@tanstack/react-router'
import { Heart, Home, ScanLine, ShoppingCart, User } from 'lucide-react'

function MobileTabBar() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="relative h-[76px]">
        <div aria-hidden="true" className="absolute inset-0 flex">
          <div className="flex-1 rounded-tl-4xl bg-card" />
          <svg viewBox="" preserveAspectRatio="none" className="h-full w-28 shrink-0 fill-card">
            <path d="M0,0 C14,0 19,38 56,38 C93,38 98,0 112,0 L112,76 L0,76 Z" />
          </svg>
          <div className="flex-1 rounded-tr-4xl bg-card" />
        </div>

        <ul className="relative flex h-full items-center justify-between px-6">
          <li className="flex flex-1 justify-center">
            <Link
              to="/"
              aria-label="Início"
              activeProps={{ 'aria-current': 'page' }}
              className="flex flex-col items-center justify-center gap-1 text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Home aria-hidden="true" className="size-5 fill-current" />
            </Link>
          </li>

          <li className="flex flex-1 justify-center">
            <button
              type="button"
              aria-label="Favoritos"
              disabled
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed"
            >
              <Heart aria-hidden="true" className="size-5 fill-current" />
            </button>
          </li>

          <li aria-hidden="true" className="flex-1" />

          <li className="flex flex-1 justify-center">
            <button
              type="button"
              aria-label="Carrinho"
              disabled
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed"
            >
              <ShoppingCart aria-hidden="true" className="size-5 fill-current" />
            </button>
          </li>

          <li className="flex flex-1 justify-center">
            <button
              type="button"
              aria-label="Perfil"
              disabled
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:cursor-not-allowed"
            >
              <User aria-hidden="true" className="size-5 fill-current" />
            </button>
          </li>
        </ul>

        <button
          type="button"
          aria-label="Mercado"
          disabled
          className="bg-gradient-accent absolute top-0 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-foreground shadow-lg disabled:cursor-not-allowed"
        >
          <ScanLine aria-hidden="true" className="size-7" />
        </button>
      </div>
    </nav>
  )
}

export { MobileTabBar }
