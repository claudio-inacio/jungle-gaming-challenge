import type { CatalogSearch } from '@/entities/nft'
import { useCatalogFilters } from '@/features/catalog-filters/model/useCatalogFilters'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

function CatalogTabs() {
  const { search, setTab } = useCatalogFilters()

  return (
    <Tabs value={search.tab} onValueChange={(value) => setTab(value as CatalogSearch['tab'])}>
      <TabsList>
        <TabsTrigger value="all">Todos os NFTs</TabsTrigger>
        <TabsTrigger value="new">Novos lançamentos</TabsTrigger>
        <TabsTrigger value="trending">Em alta</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export { CatalogTabs }
