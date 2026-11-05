import { Link } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { Button } from '@/shared/ui/button'

function MobileLoginBar() {
  return (
    <nav aria-label="Conta" className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="flex h-[76px] items-center justify-center rounded-t-4xl border-t border-border-soft bg-card px-6">
        <Button
          variant="default"
          className="w-full gap-1.5"
          nativeButton={false}
          render={<Link to="/login" />}
        >
          <LogIn aria-hidden="true" className="size-4" />
          Realizar Login
        </Button>
      </div>
    </nav>
  )
}

export { MobileLoginBar }
