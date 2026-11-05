import { Skeleton } from '@/shared/ui/skeleton'

export function CartSummarySkeleton() {
  return (
    <div
      className="flex flex-col gap-6 rounded-t-[40px] bg-card px-6 pt-6 pb-9 md:w-[var(--spacing-cart-summary-width)] md:shrink-0 md:rounded-none md:bg-transparent md:p-0"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-px w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}
