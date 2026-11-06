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

export async function endSession(queryClient: QueryClient): Promise<void> {
  setAccessToken(null)
  tokenStorage.clear()
  socket.disconnect()
  // Assenta qualquer query em voo (ex.: o fetch de sessão que disparou um 401
  // no boot) antes de limpar o cache - limpar com a query ainda buscando a
  // destrói silenciosamente sem notificar observers, travando para sempre
  // quem lê esse estado (ex. `useSessionRestoring`).
  await queryClient.cancelQueries()
  queryClient.clear()
}
