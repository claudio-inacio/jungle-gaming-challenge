import type { ReactNode } from 'react'
import { SiteHeader } from '@/widgets/header'
import { SiteFooter } from '@/widgets/footer'
import { MobileTabBar } from '@/widgets/mobile-tab-bar'

type AppLayoutProps = {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader itemCount={0} isAuthenticated={false} />

      <div className="flex-1 pb-28 md:pb-0">{children}</div>

      <div className="hidden md:block">
        <SiteFooter />
      </div>

      <MobileTabBar />
    </div>
  )
}

export { AppLayout }
