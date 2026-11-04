import { useId } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NoticeLink } from '@/shared/ui/notice-link'
import { cn } from '@/shared/lib/utils'

const MESSAGE = 'Indisponível na demonstração'

function notifyOutOfScope() {
  toast.info(MESSAGE)
}

export function OutOfScopeLink({ children, className, ...rest }: React.ComponentProps<'button'>) {
  return (
    <NoticeLink
      message={MESSAGE}
      className={cn('cursor-not-allowed text-muted-foreground opacity-70', className)}
      {...rest}
    >
      {children}
    </NoticeLink>
  )
}

export function OutOfScopeButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const noteId = useId()
  return (
    <>
      <Button {...props} type="button" onClick={notifyOutOfScope} aria-describedby={noteId}>
        {children}
      </Button>
      <span id={noteId} className="sr-only">
        {MESSAGE}
      </span>
    </>
  )
}

export function OutOfScopeInput({
  className,
  onFocus,
  ...props
}: React.ComponentProps<typeof Input>) {
  const noteId = useId()
  return (
    <>
      <Input
        aria-disabled="true"
        aria-describedby={noteId}
        className={cn('cursor-not-allowed', className)}
        onFocus={(event) => {
          notifyOutOfScope()
          onFocus?.(event)
        }}
        {...props}
      />
      <span id={noteId} className="sr-only">
        {MESSAGE}
      </span>
    </>
  )
}
