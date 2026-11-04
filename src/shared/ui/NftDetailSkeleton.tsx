import { Skeleton } from '@/shared/ui/skeleton'

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12" aria-hidden="true">
      <div className="flex flex-col gap-4 lg:w-1/2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <Skeleton className="size-16 shrink-0 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:w-1/2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-7 w-1/3" />
        <div className="flex flex-col gap-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Skeleton className="h-12 w-full rounded-lg sm:w-48" />
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
