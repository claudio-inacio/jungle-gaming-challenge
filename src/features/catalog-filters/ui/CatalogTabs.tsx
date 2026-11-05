import type { CatalogSearch } from '@/entities/nft'
import { useCatalogFilters } from '@/features/catalog-filters/model/useCatalogFilters'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const TAB_TRIGGER_CLASS =
  'h-auto flex-none rounded-none border-none bg-transparent p-0 text-sm font-medium text-muted-foreground after:hidden data-active:border-none data-active:bg-transparent data-active:font-bold data-active:text-accent-foreground'

function CatalogTabs() {
  const { search, setTab } = useCatalogFilters()

  return (
    <Tabs value={search.tab} onValueChange={(value) => setTab(value as CatalogSearch['tab'])}>
      <TabsList variant="line" className="h-auto gap-6 p-0">
        <TabsTrigger value="all" className={TAB_TRIGGER_CLASS}>
          Todos os NFTs
        </TabsTrigger>
        <TabsTrigger value="new" className={TAB_TRIGGER_CLASS}>
          Novos lançamentos
        </TabsTrigger>
        <TabsTrigger value="trending" className={TAB_TRIGGER_CLASS}>
          Em alta
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export { CatalogTabs }
