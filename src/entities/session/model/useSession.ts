import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '@/shared/api/query-keys'
import { fetchSession } from '../api/session'
import { tokenStorage } from './token-storage'
import { setAccessToken } from '@/shared/api/http'
import { socket } from '@/shared/api/socket/client'

export function useSession() {
  const queryClient = useQueryClient()

  // reidrata o token antes da query rodar — recuperação após refresh
  const storedToken = tokenStorage.get()
  if (storedToken) setAccessToken(storedToken)

  const query = useQuery({
    queryKey: queryKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: Boolean(storedToken),
    retry: false,
    staleTime: 60_000,
  })

  // conecta o socket só quando a sessão é confirmada
  useEffect(() => {
    if (query.data) {
      socket.auth = { token: tokenStorage.get() }
      socket.connect()
    }
    return () => {
      socket.disconnect()
    }
  }, [query.data?.user.id])

  return {
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(query.data),
    isLoadingSession: Boolean(storedToken) && query.isPending,
    queryClient,
  }
}
