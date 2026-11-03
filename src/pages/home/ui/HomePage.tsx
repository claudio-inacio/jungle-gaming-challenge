import { useQuery } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
// import { socket } from '@/shared/api/socket/client'

export function HomePage() {
  const { data, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) =>
      http.get<{ status: string }>('/health', { signal }).then((r) => r.data),
  })

  // socket.connect()
  // socket.on('system.ready', console.log)
  return (
    <main className="min-h-dvh bg-background p-8 text-foreground">
      <h1 className="text-2xl font-bold">Kurio</h1>
      <p className="text-muted-foreground">API: {isPending ? 'carregando…' : data?.status}</p>
    </main>
  )
}
