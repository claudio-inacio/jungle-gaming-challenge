import { QueryClientProvider } from '@tanstack/react-query'
import { Matches, RouterContextProvider } from '@tanstack/react-router'
import { queryClient } from '@/shared/api'
import { router } from '@/app/router'
import { Toaster } from '@/shared/ui/sonner'
import { SessionExpiryListener } from '@/app/model/SessionExpiryListener'
import { rehydrateAccessToken, useSessionRestoring } from '@/entities/session'
import { SessionRestoreOverlay } from '@/app/layout/SessionRestoreOverlay'

function prepareApp() {
  rehydrateAccessToken()
}

function AppContent() {
  const isRestoring = useSessionRestoring()

  return (
    <RouterContextProvider router={router}>
      <SessionExpiryListener />
      <div inert={isRestoring}>
        <Matches />
      </div>
      {isRestoring && <SessionRestoreOverlay />}
    </RouterContextProvider>
  )
}

function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  )
}

export { AppRoot, prepareApp }
