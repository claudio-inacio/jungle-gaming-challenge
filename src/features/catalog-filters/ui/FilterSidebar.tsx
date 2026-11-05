import { useState } from 'react'
import { useCatalogFilters } from '@/features/catalog-filters/model/useCatalogFilters'
import { formatEth, parseEth } from '@/shared/lib/eth'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { Slider } from '@/shared/ui/slider'

type Network = 'ethereum' | 'polygon' | 'solana'

type FilterSidebarCollection = {
  id: string
  label: string
  count?: number
}

type FilterSidebarProps = {
  collections: FilterSidebarCollection[]
  rangeMin?: number
  rangeMax?: number
}

const NETWORKS: { value: Network; label: string }[] = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
]

function formatEthNumber(value: number): string {
  return parseEth(value.toFixed(2)).toFixed(2)
}

function buildRangeAriaText(min: number, max: number): string {
  return `${formatEthNumber(min)} a ${formatEth(max.toFixed(2), 2)}`
}

function FilterSidebar({ collections, rangeMin = 0, rangeMax = 20 }: FilterSidebarProps) {
  const { search, toggleCollection, toggleNetwork, setPriceRange } = useCatalogFilters()

  const [appliedRange, setAppliedRange] = useState<[number | undefined, number | undefined]>([
    search.priceMin,
    search.priceMax,
  ])
  const [localRange, setLocalRange] = useState<[number, number]>([
    search.priceMin ?? rangeMin,
    search.priceMax ?? rangeMax,
  ])

  if (appliedRange[0] !== search.priceMin || appliedRange[1] !== search.priceMax) {
    setAppliedRange([search.priceMin, search.priceMax])
    setLocalRange([search.priceMin ?? rangeMin, search.priceMax ?? rangeMax])
  }

  function handleApplyPriceRange() {
    setPriceRange(localRange[0], localRange[1])
  }

  return (
    <aside className="w-sidebar-width shrink-0">
      <div className="flex flex-col gap-6 rounded-md border border-border-soft bg-card p-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-bold text-foreground">Coleções</legend>
          <div className="flex flex-col gap-3">
            {collections.map((collection) => {
              const inputId = `catalog-filter-collection-${collection.id}`
              return (
                <div key={collection.id} className="flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={search.collections.includes(collection.id)}
                    onCheckedChange={() => toggleCollection(collection.id)}
                  />
                  <Label
                    htmlFor={inputId}
                    className="flex-1 justify-between text-sm font-normal text-foreground"
                  >
                    <span>{collection.label}</span>
                    {collection.count !== undefined ? (
                      <span className="text-muted-foreground">({collection.count})</span>
                    ) : null}
                  </Label>
                </div>
              )
            })}
          </div>
        </fieldset>

        <Separator />

        <fieldset className="flex flex-col gap-4">
          <legend className="text-base font-bold text-foreground">Faixa de preço</legend>
          <Slider
            value={localRange}
            min={rangeMin}
            max={rangeMax}
            step={0.01}
            onValueChange={(nextValue) => setLocalRange(nextValue as [number, number])}
            getAriaValueText={() => buildRangeAriaText(localRange[0], localRange[1])}
            getAriaLabel={(index) => (index === 0 ? 'Preço mínimo' : 'Preço máximo')}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatEthNumber(localRange[0])} ETH</span>
            <span>{formatEth(localRange[1].toFixed(2), 2)}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleApplyPriceRange}>
            Aplicar
          </Button>
        </fieldset>

        <Separator />

        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-bold text-foreground">Rede</legend>
          <div className="flex flex-col gap-3">
            {NETWORKS.map((network) => {
              const inputId = `catalog-filter-network-${network.value}`
              return (
                <div key={network.value} className="flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={search.network.includes(network.value)}
                    onCheckedChange={() => toggleNetwork(network.value)}
                  />
                  <Label htmlFor={inputId} className="text-sm font-normal text-foreground">
                    {network.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </fieldset>
      </div>
    </aside>
  )
}

export { FilterSidebar }
export type { FilterSidebarCollection, FilterSidebarProps }
