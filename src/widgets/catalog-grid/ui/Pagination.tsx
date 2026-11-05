import { ChevronRight } from 'lucide-react'
import { useCatalogFilters } from '@/features/catalog-filters'
import { Button } from '@/shared/ui/button'

type PageEntry = number | 'ellipsis-start' | 'ellipsis-end'

const MAX_VISIBLE_PAGES = 4

function getPaginationRange(current: number, total: number): PageEntry[] {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= MAX_VISIBLE_PAGES - 1) {
    return [1, 2, 3, 'ellipsis-end', total]
  }

  if (current >= total - (MAX_VISIBLE_PAGES - 2)) {
    return [1, 'ellipsis-start', total - 2, total - 1, total]
  }

  return [1, 'ellipsis-start', current, 'ellipsis-end', total]
}

type PaginationProps = {
  page: number
  total: number
  pageSize: number
}

function Pagination({ page: currentPage, total, pageSize }: PaginationProps) {
  const { setPage } = useCatalogFilters()
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) {
    return null
  }

  const pages = getPaginationRange(currentPage, totalPages)
  const isLastPage = currentPage >= totalPages

  return (
    <nav aria-label="Paginação" className="flex items-center justify-end gap-2">
      <ul className="flex items-center gap-2">
        {pages.map((page) =>
          typeof page === 'number' ? (
            <li key={page}>
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size="icon"
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={page === currentPage ? undefined : `Página ${page}`}
                className="size-[35px]"
                onClick={() => setPage(page)}
              >
                {page}
              </Button>
            </li>
          ) : (
            <li
              key={page}
              aria-hidden="true"
              className="flex size-[35px] items-center justify-center"
            >
              …
            </li>
          ),
        )}
      </ul>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={isLastPage}
        className="size-[35px]"
        onClick={() => setPage(currentPage + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

export { Pagination }
