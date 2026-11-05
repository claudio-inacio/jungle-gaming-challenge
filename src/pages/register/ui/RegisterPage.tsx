import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMediaQuery } from '@/shared/lib/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { AuthTabs } from '@/shared/ui/auth-tabs'
import { RegisterForm } from '@/features/register'

export function RegisterPage() {
  const { redirect } = useSearch({ from: '/register' })
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && navigate({ to: '/' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <AuthTabs active="register" redirect={redirect} />
            </DialogTitle>
            <DialogDescription>
              Crie seu perfil de colecionador e conecte uma carteira quando quiser.
            </DialogDescription>
          </DialogHeader>
          <RegisterForm redirectTo={redirect} />
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
        <h1 className="text-2xl font-bold text-foreground">Criar perfil de colecionador</h1>
        <RegisterForm redirectTo={redirect} submitLabel="Criar perfil" />
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-medium text-accent-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Entre
          </Link>
        </p>
      </div>
    </main>
  )
}
