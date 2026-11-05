import type { QueryClient } from '@tanstack/react-query'
import { setAccessToken, queryKeys, socket, type Session } from '@/shared/api'
import { tokenStorage } from './token-storage'

export function rehydrateAccessToken(): string | null {
  const token = tokenStorage.get()
  if (token) setAccessToken(token)
  return token
}

export function startSession(queryClient: QueryClient, session: Session): void {
  setAccessToken(session.accessToken)
  tokenStorage.set(session.accessToken)
  queryClient.setQueryData(queryKeys.session(), session)
}

export function endSession(queryClient: QueryClient): void {
  setAccessToken(null)
  tokenStorage.clear()
  socket.disconnect()
  queryClient.clear()
}
