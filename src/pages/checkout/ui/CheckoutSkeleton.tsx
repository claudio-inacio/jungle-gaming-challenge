import { Skeleton } from '@/shared/ui/skeleton'

export function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row" aria-hidden="true">
      <Skeleton className="h-[500px] w-full lg:max-w-[763px] lg:flex-1" />
      <Skeleton className="h-[500px] w-full lg:w-[405px] lg:shrink-0" />
    </div>
  )
}
