import { cn } from '@/shared/lib/utils'

export function Container({ className, children, ...rest }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto box-content  px-3 lg:px-4', className)} {...rest}>
      {children}
    </div>
  )
}
