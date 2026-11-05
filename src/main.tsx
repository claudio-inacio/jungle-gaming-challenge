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
// import { ScenarioPanelGate } from './mocks/dev/ScenarioPanelGate'

async function enableMocking() {
  if (!env.enableMocks) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

// `@/shared/api` e `@/app/router` puxam socket.io-client, que lê
// `globalThis.WebSocket` assim que seu módulo é avaliado (e não só quando
// conecta). Importá-los estaticamente no topo deste arquivo os avaliaria
// antes de `enableMocking` interceptar o WebSocket global via MSW, travando
// a captura na implementação nativa. O import dinâmico abaixo garante que
// esses módulos só carregam depois do worker do MSW já estar ativo.
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
        {/* <ScenarioPanelGate /> */}
      </QueryClientProvider>
    </StrictMode>,
  )
})
