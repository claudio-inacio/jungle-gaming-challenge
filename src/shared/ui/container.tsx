import { cn } from '@/shared/lib/utils'

export function Container({ className, children, ...rest }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto box-content max-w-page px-4 lg:px-6', className)} {...rest}>
      {children}
    </div>
  )
}
