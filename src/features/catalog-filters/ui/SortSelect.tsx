import type { CatalogSearch } from '@/entities/nft'
import { useCatalogFilters } from '@/features/catalog-filters/model/useCatalogFilters'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type SortOption = {
  value: CatalogSearch['sort']
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'recent', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
]

function getSortLabel(sort: CatalogSearch['sort']): string {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? ''
}

function SortSelect() {
  const { search, setSort } = useCatalogFilters()

  return (
    <Select value={search.sort} onValueChange={(value) => setSort(value as CatalogSearch['sort'])}>
      <SelectTrigger
        aria-label="Ordenar por"
        className="border-none bg-transparent p-0 text-sm font-medium text-foreground shadow-none hover:bg-transparent hover:text-accent-foreground"
      >
        <SelectValue>Ordenar por: {getSortLabel(search.sort)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { SortSelect }
