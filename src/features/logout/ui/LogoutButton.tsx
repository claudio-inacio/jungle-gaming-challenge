import { LogOut } from 'lucide-react'
import { useSession } from '@/entities/session'
import { useLogout } from '../model/useLogout'
import { LogoutDialog } from './LogoutDialog'
import { cn } from '@/shared/lib/utils'

export function LogoutButton({ className }: { className?: string }) {
  const { user } = useSession()
  const logout = useLogout()

  return (
    <>
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className={cn(
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <LogOut aria-hidden="true" className="size-5 shrink-0" />
        Sair
      </button>
      <LogoutDialog open={logout.isPending} userName={user?.displayName} />
    </>
  )
}
