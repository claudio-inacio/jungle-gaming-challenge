import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  const { redirect } = useSearch({ from: '/login' })
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const content = (
    <>
      <p className="text-muted-foreground text-sm mb-6">
        Entre para gerenciar sua carteira, coleção e perfil de criador.
      </p>
      <LoginForm redirectTo={redirect} />
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && navigate({ to: '/' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <main className="min-h-dvh p-6">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>
      {content}
    </main>
  )
}
