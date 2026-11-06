import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Matches, RouterContextProvider } from '@tanstack/react-router'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'
import '@fontsource/roboto-mono/700.css'
import './index.css'
import '@/shared/config/zod'
import { env } from '@/shared/config'
import { Toaster } from '@/shared/ui/sonner'

async function enableMocking() {
  if (!env.enableMocks) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

// Import dinâmico: `@/shared/api`/`@/app/router` avaliam socket.io-client no
// load do módulo, que já lê `globalThis.WebSocket` nesse momento - carregar
// isso antes do worker do MSW estar ativo travaria a captura do WebSocket
// na implementação nativa em vez da simulada.
enableMocking().then(async () => {
  const [{ queryClient }, { router }, { SessionExpiryListener }, { rehydrateAccessToken }] =
    await Promise.all([
      import('@/shared/api'),
      import('@/app/router'),
      import('@/app/model/SessionExpiryListener'),
      import('@/entities/session'),
    ])

  rehydrateAccessToken()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <SessionExpiryListener />
          <Matches />
        </RouterContextProvider>
        <Toaster />
      </QueryClientProvider>
    </StrictMode>,
  )
})
