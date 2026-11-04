import { Skeleton } from '@/shared/ui/skeleton'

export function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="size-8 rounded-full md:hidden" />
    </div>
  )
}
