import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { AuthTabs, LoginForm } from '@/features/auth'

export function LoginPage() {
  const { redirect } = useSearch({ from: '/login' })
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && navigate({ to: '/' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <AuthTabs active="login" redirect={redirect} />
            </DialogTitle>
            <DialogDescription>
              Entre para gerenciar sua carteira, coleção e perfil de criador.
            </DialogDescription>
          </DialogHeader>
          <LoginForm redirectTo={redirect} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center gap-10 bg-background px-6 py-10">
      <Link
        to="/"
        className="text-sm font-bold tracking-[0.1em] text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        KURIO
      </Link>

      <div className="flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <LoginForm redirectTo={redirect} />
        <p className="text-center text-sm text-muted-foreground">
          Novo na Kurio?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="font-medium text-accent-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Crie uma conta
          </Link>
        </p>
      </div>
    </main>
  )
}
