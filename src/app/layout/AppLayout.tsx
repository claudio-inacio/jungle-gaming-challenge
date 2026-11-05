import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { SiteHeader } from '@/widgets/header'
import { SiteFooter } from '@/widgets/footer'
import { MobileTabBar } from '@/widgets/mobile-tab-bar'
import { cn } from '@/shared/lib/utils'

type AppLayoutProps = {
  children: ReactNode
}

const AUTH_ROUTES = new Set(['/login', '/register'])

function AppLayout({ children }: AppLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuthRoute = AUTH_ROUTES.has(pathname)

  return (
    <div className="flex min-h-dvh flex-col py-0 md:py-2 px-0 md:px-20">
      <div className={cn(isAuthRoute && 'hidden md:block')}>
        <SiteHeader itemCount={0} />
      </div>

      <div className={cn('flex-1', !isAuthRoute && 'pb-28 md:pb-0')}>{children}</div>

      {!isAuthRoute && (
        <div className="hidden md:block">
          <SiteFooter />
        </div>
      )}

      {!isAuthRoute && <MobileTabBar />}
    </div>
  )
}

export { AppLayout }
