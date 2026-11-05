import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys, setAccessToken, socket } from '@/shared/api'
import { fetchSession } from '../api/session'
import { tokenStorage } from './token-storage'

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

  const userId = query.data?.user.id

  // conecta o socket só quando a sessão é confirmada
  useEffect(() => {
    if (!userId) return
    socket.auth = { token: tokenStorage.get() }
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [userId])

  return {
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(query.data),
    isLoadingSession: Boolean(storedToken) && query.isPending,
    queryClient,
  }
}
