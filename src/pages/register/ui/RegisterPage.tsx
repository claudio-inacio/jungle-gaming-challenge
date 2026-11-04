import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { RegisterForm } from '@/features/auth'

export function RegisterPage() {
  const { redirect } = useSearch({ from: '/register' })
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const content = (
    <>
      <p className="text-muted-foreground text-sm mb-6">
        Crie sua conta para gerenciar sua carteira, coleção e perfil de criador.
      </p>
      <RegisterForm redirectTo={redirect} />
      <p className="text-sm text-muted-foreground mt-6">
        Já tem conta?{' '}
        <Link
          to="/login"
          search={{ redirect }}
          className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Entrar
        </Link>
      </p>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && navigate({ to: '/' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar conta</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <main className="min-h-dvh p-6">
      <h1 className="text-2xl font-bold mb-6">Criar conta</h1>
      {content}
    </main>
  )
}
