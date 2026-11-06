import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/entities/session'
import { cartQuery } from '@/entities/cart'
import { SiteHeader } from '@/widgets/header'
import { SiteFooter } from '@/widgets/footer'
import { MobileTabBar, MobileLoginBar } from '@/widgets/mobile-tab-bar'
import { cn } from '@/shared/lib/utils'

type AppLayoutProps = {
  children: ReactNode
}

const AUTH_ROUTES = new Set(['/login', '/register'])

// NftDetailMobile.tsx substitui header/footer/tab bar padrão no mobile.
const MOBILE_OWN_CHROME_ROUTE_PATTERN = /^\/nft\//

function AppLayout({ children }: AppLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuthRoute = AUTH_ROUTES.has(pathname)
  const hasOwnMobileChrome = MOBILE_OWN_CHROME_ROUTE_PATTERN.test(pathname)
  const { user, isAuthenticated, isLoadingSession } = useSession()
  const cart = useQuery({ ...cartQuery(user?.id ?? ''), enabled: isAuthenticated })
  const itemCount = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <div className="flex min-h-dvh flex-col py-0 md:py-2 px-0 md:px-20">
      <div
        className={cn(isAuthRoute && 'hidden md:block', hasOwnMobileChrome && 'hidden lg:block')}
      >
        <SiteHeader itemCount={itemCount} />
      </div>

      <div className={cn('flex-1', !isAuthRoute && !hasOwnMobileChrome && 'pb-28 md:pb-0')}>
        {children}
      </div>

      {!isAuthRoute && (
        <div className={cn('hidden md:block', hasOwnMobileChrome && 'md:hidden lg:block')}>
          <SiteFooter />
        </div>
      )}

      {!isAuthRoute &&
        !hasOwnMobileChrome &&
        (isLoadingSession || isAuthenticated ? <MobileTabBar /> : <MobileLoginBar />)}
    </div>
  )
}

export { AppLayout }
