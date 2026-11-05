import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

export function NotFoundPage() {
  return (
    <main>
      <Container className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-muted-foreground">
          O conteúdo que você procura não existe ou foi removido.
        </p>
        <Button nativeButton={false} render={<Link to="/" />}>
          Voltar para o início
        </Button>
      </Container>
    </main>
  )
}
