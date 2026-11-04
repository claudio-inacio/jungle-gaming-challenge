import { cn } from 'cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} {...props} />
}

export { Skeleton }
