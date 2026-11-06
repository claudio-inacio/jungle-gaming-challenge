import { Skeleton } from '@/shared/ui/skeleton'

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="h-[18px] w-24" />
      <Skeleton className="h-10 w-full rounded-[3px]" />
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6" aria-hidden="true">
      <div className="flex items-center gap-6">
        <Skeleton className="size-[50px] rounded-full" />
        <Skeleton className="h-10 w-[98px] rounded-[3px]" />
      </div>

      <div className="grid grid-cols-1 gap-x-7 gap-y-6 lg:grid-cols-2 lg:[&>*]:max-w-[417px]">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <Skeleton className="h-10 w-[131px] self-end rounded-[3px]" />

      <div className="flex max-w-[417px] flex-col gap-6">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <Skeleton className="h-10 w-[131px] self-end rounded-[3px]" />
    </div>
  )
}
