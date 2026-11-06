import { Hero } from '@/widgets/hero'
import { Container } from '@/shared/ui/container'
import { Skeleton } from '@/shared/ui/skeleton'

function BootShellHeader() {
  return (
    <header className="w-full bg-background">
      <Container className="flex h-16 items-center justify-between gap-4 border-b border-border">
        <span className="hidden shrink-0 text-sm font-bold tracking-[0.1em] text-foreground lg:block">
          KURIO
        </span>
        <div className="flex w-full items-center gap-3 lg:hidden">
          <span className="text-sm font-bold tracking-[0.1em] text-foreground">KURIO</span>
        </div>
      </Container>
    </header>
  )
}

function CatalogSkeleton() {
  return (
    <section className="flex flex-col gap-8 lg:flex-row lg:gap-sidebar-gap">
      <div className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    </section>
  )
}

function GenericPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-6 py-10">
      <Container className="flex w-full flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </Container>
    </main>
  )
}

function BootShell() {
  const isHome = window.location.pathname === '/'

  return (
    <div aria-busy="true" inert className="flex min-h-dvh flex-col py-0 md:py-2 px-0 md:px-20">
      <BootShellHeader />
      {isHome ? (
        <main className="flex flex-col gap-[96px]">
          <Hero />
          <CatalogSkeleton />
        </main>
      ) : (
        <GenericPageSkeleton />
      )}
    </div>
  )
}

export { BootShell }
