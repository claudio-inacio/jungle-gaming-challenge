import { NoticeLink } from '@/shared/ui/notice-link'

const MESSAGE = 'Disponível em breve'

export function PendingLink({ className, ...rest }: React.ComponentProps<'button'>) {
  return <NoticeLink message={MESSAGE} className={className} {...rest} />
}
