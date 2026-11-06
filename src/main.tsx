import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'
import '@fontsource/roboto-mono/700.css'
import './index.css'
import '@/shared/config/zod'
import { env } from '@/shared/config'
import { BootShell } from '@/app/layout/BootShell'

async function enableMocking() {
  if (!env.enableMocks) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <BootShell />
  </StrictMode>,
)

// Import dinâmico: `@/shared/api`/`@/app/router` avaliam socket.io-client no
// load do módulo, que já lê `globalThis.WebSocket` nesse momento - carregar
// isso antes do worker do MSW estar ativo travaria a captura do WebSocket
// na implementação nativa em vez da simulada. O `BootShell` não toca nesses
// módulos, então pode renderizar antes do MSW estar pronto.
enableMocking()
  .then(async () => {
    const { AppRoot, prepareApp } = await import('@/app/AppRoot')
    prepareApp()
    root.render(
      <StrictMode>
        <AppRoot />
      </StrictMode>,
    )
  })
  .catch(() => {
    root.render(
      <p role="alert" className="flex min-h-dvh items-center justify-center p-6 text-center">
        Não foi possível iniciar a aplicação. Recarregue a página.
      </p>,
    )
  })
