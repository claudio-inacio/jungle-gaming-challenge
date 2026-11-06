import { Skeleton } from '@/shared/ui/skeleton'

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="h-[18px] w-24" />
      <Skeleton className="h-10 w-full rounded-[3px]" />
    </div>
  )
}

export function WalletsPageSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-5 w-40" />

      <div className="grid grid-cols-1 gap-x-7 gap-y-6 lg:grid-cols-2 lg:[&>*]:max-w-[417px]">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <Skeleton className="h-10 w-[131px] self-end rounded-[3px]" />

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-16 w-full max-w-[417px] rounded-[3px]" />
    </div>
  )
}
