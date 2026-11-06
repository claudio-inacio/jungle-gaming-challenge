import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Hero } from '@/widgets/hero'

import { CatalogGrid } from '@/widgets/catalog-grid'
import { PromoCards } from '@/widgets/promo-cards'
import { BlogSection } from '@/widgets/blog-section'
import { nftCollectionsQuery } from '@/entities/nft'
import {
  CatalogTabs,
  FilterSidebar,
  SortSelect,
  useMobileFilterSheetOpen,
  closeMobileFilterSheet,
} from '@/features/catalog-filters'
import { useMediaQuery } from '@/shared/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'

export function HomePage() {
  const search = useSearch({ from: '/' })
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isMobileFilterOpen = useMobileFilterSheetOpen()
  const collectionsQuery = useQuery(nftCollectionsQuery())
  const collections = (collectionsQuery.data ?? []).map((collection) => ({
    id: collection.id,
    label: collection.name,
    count: collection.count,
  }))

  useEffect(() => closeMobileFilterSheet, [])

  return (
    <main className="flex flex-col gap-[96px]">
      <Hero />
      <section className="flex flex-col gap-8 lg:flex-row lg:gap-sidebar-gap">
        {isDesktop ? (
          <FilterSidebar collections={collections} />
        ) : (
          <Sheet
            open={isMobileFilterOpen}
            onOpenChange={(open) => {
              if (!open) closeMobileFilterSheet()
            }}
          >
            <SheetContent id="mobile-filter-sheet" side="left" className="w-11/12 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <FilterSidebar collections={collections} />
              </div>
            </SheetContent>
          </Sheet>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CatalogTabs />
            <SortSelect />
          </div>
          <CatalogGrid search={search} />
        </div>
      </section>
      <PromoCards />
      <BlogSection />
    </main>
  )
}
