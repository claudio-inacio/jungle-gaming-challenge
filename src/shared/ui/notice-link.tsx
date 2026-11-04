import { useId } from 'react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'

type NoticeLinkProps = {
  message: string
} & React.ComponentProps<'button'>

export function NoticeLink({
  message,
  className,
  children,
  type,
  onClick,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: NoticeLinkProps) {
  const noteId = useId()
  const describedBy = ariaDescribedBy ? `${ariaDescribedBy} ${noteId}` : noteId

  return (
    <>
      <button
        type={type ?? 'button'}
        aria-disabled="true"
        aria-describedby={describedBy}
        className={cn(
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          className,
        )}
        onClick={(event) => {
          toast.info(message)
          onClick?.(event)
        }}
        {...rest}
      >
        {children}
      </button>
      <span id={noteId} className="sr-only">
        {message}
      </span>
    </>
  )
}
