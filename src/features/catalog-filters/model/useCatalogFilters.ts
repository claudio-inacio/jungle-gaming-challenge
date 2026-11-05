import { useNavigate, useSearch } from '@tanstack/react-router'
import type { CatalogSearch } from '@/entities/nft'

type Network = CatalogSearch['network'][number]

export function useCatalogFilters() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })

  function toggleCollection(collectionId: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        collections: prev.collections.includes(collectionId)
          ? prev.collections.filter((id) => id !== collectionId)
          : [...prev.collections, collectionId],
        page: 1,
      }),
    })
  }

  function toggleNetwork(network: Network) {
    navigate({
      search: (prev) => ({
        ...prev,
        network: prev.network.includes(network)
          ? prev.network.filter((item) => item !== network)
          : [...prev.network, network],
        page: 1,
      }),
    })
  }

  function setPriceRange(min: number | undefined, max: number | undefined) {
    navigate({
      search: (prev) => ({
        ...prev,
        priceMin: min,
        priceMax: max,
        page: 1,
      }),
    })
  }

  function setTab(tab: CatalogSearch['tab']) {
    navigate({
      search: (prev) => ({
        ...prev,
        tab,
        page: 1,
      }),
    })
  }

  function setSort(sort: CatalogSearch['sort']) {
    navigate({
      search: (prev) => ({
        ...prev,
        sort,
        page: 1,
      }),
    })
  }

  function setPage(page: number) {
    navigate({
      search: (prev) => ({
        ...prev,
        page,
      }),
    })
  }

  return {
    search,
    toggleCollection,
    toggleNetwork,
    setPriceRange,
    setTab,
    setSort,
    setPage,
  }
}
