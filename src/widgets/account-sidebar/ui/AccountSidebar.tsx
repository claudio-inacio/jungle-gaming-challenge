import {
  Activity,
  Download,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  TriangleAlert,
  User,
} from 'lucide-react'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'
import { PendingLink } from '@/shared/ui/pending-link'
import { cn } from '@/shared/lib/utils'

type AccountSidebarItemKey = 'profile' | 'wallets'

type AccountSidebarProps = {
  active?: AccountSidebarItemKey
}

const REAL_ITEMS: { key: AccountSidebarItemKey; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Dados do perfil', icon: User },
  { key: 'wallets', label: 'Carteiras', icon: MapPin },
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

function AccountSidebar({ active = 'profile' }: AccountSidebarProps) {
  return (
    <aside aria-labelledby="account-sidebar-heading" className="w-full bg-card sm:max-w-[310px]">
      <h2
        id="account-sidebar-heading"
        className="p-2.5 text-center text-lg font-bold text-foreground"
      >
        Meu perfil
      </h2>

      <nav aria-label="Minha conta">
        <ul className="flex flex-col">
          {REAL_ITEMS.map((item) => {
            const isActive = item.key === active
            return (
              <li key={item.key}>
                <span
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 border-l-[6px] border-transparent px-4 py-3 text-[15px] text-accent-foreground',
                    isActive && 'border-primary',
                  )}
                >
                  <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                  {item.label}
                </span>
              </li>
            )
          })}

          {PENDING_ITEMS.map((item) => (
            <li key={item.label}>
              <PendingLink className="flex w-full items-center gap-3 border-l-[6px] border-transparent px-4 py-3 text-[15px] text-accent-foreground">
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.label}
              </PendingLink>
            </li>
          ))}

          {OUT_OF_SCOPE_ITEMS.map((item) => (
            <li key={item.label}>
              <OutOfScopeLink className="flex w-full items-center gap-3 border-l-[6px] border-transparent px-4 py-3 text-[15px] text-accent-foreground opacity-100">
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.label}
              </OutOfScopeLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border-soft px-4 py-2.5">
        <PendingLink className="flex h-10 w-full items-center gap-2 text-[15px] font-bold text-accent-foreground">
          <LogOut aria-hidden="true" className="size-5 shrink-0" />
          Sair
        </PendingLink>
      </div>
    </aside>
  )
}

export { AccountSidebar }
export type { AccountSidebarProps }
