import { Skeleton } from '@/shared/ui/skeleton'

export function CartSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-6" aria-hidden="true">
      <Skeleton className="h-5 w-1/3" />
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
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}
