import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O conteúdo que você procura não existe ou foi removido.
      </p>
      <Button render={<Link to="/" />}>Voltar para o início</Button>
    </main>
  )
}
