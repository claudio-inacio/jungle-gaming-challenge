import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys, socket } from '@/shared/api'
import { fetchSession } from '../api/session'
import { tokenStorage } from './token-storage'

// `useSession()` monta em vários pontos da árvore ao mesmo tempo; sem essa
// contagem, cada instância desconectaria o socket COMPARTILHADO ao desmontar,
// derrubando as outras. Só a primeira a montar conecta, só a última desconecta.
let activeSessionConsumers = 0

export function useSession() {
  const queryClient = useQueryClient()
  const storedToken = tokenStorage.get()

  const query = useQuery({
    queryKey: queryKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: Boolean(storedToken),
    retry: false,
    staleTime: 60_000,
  })

  const userId = query.data?.user.id

  useEffect(() => {
    if (!userId) return
    socket.auth = { token: tokenStorage.get() }
    function identify() {
      socket.emit('identify', { token: tokenStorage.get() })
    }
    socket.on('connect', identify)
    activeSessionConsumers += 1
    if (activeSessionConsumers === 1) socket.connect()
    return () => {
      socket.off('connect', identify)
      activeSessionConsumers -= 1
      if (activeSessionConsumers === 0) socket.disconnect()
    }
  }, [userId])

  return {
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(query.data),
    isLoadingSession: Boolean(storedToken) && query.isPending,
    queryClient,
  }
}
