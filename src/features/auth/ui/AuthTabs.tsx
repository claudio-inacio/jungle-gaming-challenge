import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'

type AuthTabsProps = {
  active: 'login' | 'register'
  redirect?: string
}

function AuthTabs({ active, redirect }: AuthTabsProps) {
  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <Link
        to="/login"
        search={{ redirect }}
        className={cn(
          'rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          active === 'login' ? 'text-accent-foreground' : 'text-muted-foreground',
        )}
      >
        Entrar
      </Link>
      <span aria-hidden="true" className="text-muted-foreground">
        |
      </span>
      <Link
        to="/register"
        search={{ redirect }}
        className={cn(
          'rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          active === 'register' ? 'text-accent-foreground' : 'text-muted-foreground',
        )}
      >
        Criar conta
      </Link>
    </div>
  )
}

export { AuthTabs }
