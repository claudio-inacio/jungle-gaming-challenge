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
import { queryClient } from '@/shared/api'
import { router } from '@/app/router'
import { SessionExpiryListener } from '@/app/providers/SessionExpiryListener'
import { Toaster } from '@/shared/ui/sonner'
import { ScenarioPanelGate } from './mocks/dev/ScenarioPanelGate'

async function enableMocking() {
  if (!env.enableMocks) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <SessionExpiryListener />
          <Matches />
        </RouterContextProvider>
        <Toaster />
        <ScenarioPanelGate />
      </QueryClientProvider>
    </StrictMode>,
  )
})
