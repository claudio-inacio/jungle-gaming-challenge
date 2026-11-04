import { useId } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

const MESSAGE = 'Indisponível na demonstração'

function notifyOutOfScope() {
  toast.info(MESSAGE)
}

export function OutOfScopeLink({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn('cursor-not-allowed text-muted-foreground opacity-70', className)}
      aria-disabled="true"
      onClick={notifyOutOfScope}
    >
      {children}
    </button>
  )
}

export function OutOfScopeButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const noteId = useId()
  return (
    <Button {...props} type="button" onClick={notifyOutOfScope} aria-describedby={noteId}>
      {children}
      <span id={noteId} className="sr-only">
        {MESSAGE}
      </span>
    </Button>
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
