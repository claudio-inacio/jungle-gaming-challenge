import { Link } from '@tanstack/react-router'
import {
  Activity,
  Download,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  TriangleAlert,
  User,
} from 'lucide-react'
import { LogoutButton } from '@/features/logout'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'
import { PendingLink } from '@/shared/ui/pending-link'
import { cn } from '@/shared/lib/utils'

const REAL_ITEMS: { to: '/profile' | '/wallets'; label: string; icon: typeof User }[] = [
  { to: '/profile', label: 'Dados do perfil', icon: User },
  { to: '/wallets', label: 'Carteiras', icon: MapPin },
]

const PENDING_ITEMS: { label: string; icon: typeof User }[] = [
  { label: 'Pedidos', icon: Package },
  { label: 'Lista de interesse', icon: Heart },
]

const OUT_OF_SCOPE_ITEMS: { label: string; icon: typeof User }[] = [
  { label: 'Atividade', icon: ShoppingBag },
  { label: 'Ofertas', icon: Activity },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: TriangleAlert },
]

const NAV_ITEM_CLASSNAME =
  'flex h-[45px] w-full items-center gap-3 border-l-[6px] px-4 text-[15px] text-accent-foreground transition-colors hover:bg-border-soft/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset'

function AccountSidebar() {
  return (
    <aside
      aria-labelledby="account-sidebar-heading"
      className="flex w-full flex-col items-start rounded-[14px] bg-card py-2 shadow-[0px_20px_20px_rgba(10,6,4,0.45)] lg:max-w-[310px] lg:rounded-none lg:shadow-none"
    >
      <h2
        id="account-sidebar-heading"
        className="w-full p-2.5 text-center text-lg font-bold text-foreground"
      >
        Meu perfil
      </h2>

      <nav aria-label="Minha conta" className="w-full">
        <ul className="flex flex-col">
          {REAL_ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={NAV_ITEM_CLASSNAME}
                activeProps={{ className: 'border-primary', 'aria-current': 'page' }}
                inactiveProps={{ className: 'border-transparent' }}
              >
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            </li>
          ))}

          {PENDING_ITEMS.map((item) => (
            <li key={item.label}>
              <PendingLink className={cn(NAV_ITEM_CLASSNAME, 'border-transparent')}>
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.label}
              </PendingLink>
            </li>
          ))}

          {OUT_OF_SCOPE_ITEMS.map((item) => (
            <li key={item.label}>
              <OutOfScopeLink
                className={cn(NAV_ITEM_CLASSNAME, 'border-transparent text-muted-foreground')}
              >
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.label}
              </OutOfScopeLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="w-full border-t border-border-soft px-4 py-2.5">
        <LogoutButton className="flex h-10 w-full items-center gap-2 text-[15px] font-bold text-accent-foreground" />
      </div>
    </aside>
  )
}

export { AccountSidebar }
