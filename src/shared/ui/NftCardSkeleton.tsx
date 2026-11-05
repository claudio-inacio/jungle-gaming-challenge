import { Skeleton } from '@/shared/ui/skeleton'

export function NftCardSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-1 lg:w-full lg:max-w-[258px] lg:p-[7px]"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[244/286] w-full shrink-0 rounded-xl" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  )
}
