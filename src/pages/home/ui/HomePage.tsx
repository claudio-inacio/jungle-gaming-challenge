import { useSearch } from '@tanstack/react-router'
import { Hero } from '@/widgets/hero'

import { CatalogGrid } from '@/widgets/catalog-grid'
import { PromoCards } from '@/widgets/promo-cards'
import { BlogSection } from '@/widgets/blog-section'
import { CatalogTabs, FilterSidebar, SortSelect } from '@/features/catalog-filters'

export function HomePage() {
  const search = useSearch({ from: '/' })

  return (
    <main className="flex flex-col gap-[96px]">
      <Hero />
      <section className="flex flex-col gap-8 lg:flex-row lg:gap-sidebar-gap">
        <FilterSidebar collections={[]} />
        <div className="flex-1 flex flex-col gap-8">
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
