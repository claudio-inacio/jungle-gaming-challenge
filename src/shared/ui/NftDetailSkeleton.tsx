import { Skeleton } from '@/shared/ui/skeleton'

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden="true">
      <Skeleton className="h-4 w-32" />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-col gap-3 lg:w-1/2 lg:flex-row lg:gap-4">
          <div className="order-2 flex flex-row gap-3 lg:order-1 lg:w-20 lg:shrink-0 lg:flex-col">
            <Skeleton className="size-16 shrink-0 rounded-lg lg:size-20" />
            <Skeleton className="size-16 shrink-0 rounded-lg lg:size-20" />
            <Skeleton className="size-16 shrink-0 rounded-lg lg:size-20" />
            <Skeleton className="size-16 shrink-0 rounded-lg lg:size-20" />
          </div>
          <Skeleton className="order-1 aspect-square w-full rounded-xl lg:order-2 lg:flex-1" />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-full sm:w-36" />
            <Skeleton className="h-10 w-full rounded-md sm:w-36" />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-6 border-b border-border pb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex justify-center gap-4">
          <Skeleton className="aspect-[244/286] w-61 shrink-0 rounded-xl" />
          <Skeleton className="hidden aspect-[244/286] w-61 shrink-0 rounded-xl sm:block" />
          <Skeleton className="hidden aspect-[244/286] w-61 shrink-0 rounded-xl lg:block" />
        </div>
      </div>
    </div>
  )
}
