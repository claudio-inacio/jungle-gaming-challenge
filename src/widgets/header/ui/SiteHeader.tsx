import { Link } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart, SlidersHorizontal, User } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'

type SiteHeaderProps = {
  itemCount: number
  isAuthenticated: boolean
}

function SiteHeader({ itemCount, isAuthenticated }: SiteHeaderProps) {
  return (
    <header className="w-full border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="hidden shrink-0 text-sm font-bold tracking-[0.1em] text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:block"
        >
          KURIO
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-10 md:flex">
          <Link
            to="/"
            className="text-base font-bold text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            activeProps={{ 'aria-current': 'page' }}
          >
            Início
          </Link>
          <span className="text-base font-normal text-foreground/70">Mercado</span>
          <OutOfScopeLink className="text-base font-normal">Criadores</OutOfScopeLink>
          <OutOfScopeLink className="text-base font-normal">Aprenda</OutOfScopeLink>
        </nav>

        <div className="hidden items-center gap-5 sm:gap-7 md:flex">
          <Button type="button" variant="ghost" size="icon" aria-label="Buscar">
            <Search aria-hidden="true" className="size-5" />
          </Button>

          <span className="relative inline-flex">
            <ShoppingCart aria-hidden="true" className="size-6 text-foreground" />
            {itemCount > 0 ? (
              <Badge
                aria-label={`${itemCount} ${itemCount === 1 ? 'item' : 'itens'} no carrinho`}
                className="absolute -top-2 -right-2 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                {itemCount}
              </Badge>
            ) : null}
          </span>

          {isAuthenticated ? (
            <span
              aria-label="Minha conta"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-foreground"
            >
              <User aria-hidden="true" className="size-5" />
            </span>
          ) : (
            <Button type="button" variant="default" className="gap-1.5">
              <LogIn aria-hidden="true" className="size-4" />
              Entrar
            </Button>
          )}
        </div>

        <div className="flex w-full items-center gap-3 md:hidden">
          <div className="relative flex h-[45px] flex-1 items-center gap-2 rounded-xl bg-card pl-3 pr-3">
            <Search aria-hidden="true" className="size-5 shrink-0 text-brand-secondary" />
            <label htmlFor="mobile-explore-collections" className="sr-only">
              Explorar coleções
            </label>
            <input
              id="mobile-explore-collections"
              type="search"
              placeholder="Explorar coleções"
              className="w-full bg-transparent text-sm font-bold text-brand-secondary placeholder:text-brand-secondary focus:outline-none"
            />
          </div>

          <button
            type="button"
            aria-label="Abrir filtros e opções avançadas"
            className="bg-gradient-accent flex size-11 shrink-0 items-center justify-center rounded-2xl text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
          </button>
        </div>
      </Container>
    </header>
  )
}

export { SiteHeader }
export type { SiteHeaderProps }
