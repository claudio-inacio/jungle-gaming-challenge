import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socket, queryKeys, realtimeEventSchema } from '@/shared/api'
import { useSession } from '@/entities/session/@x/cart'

// Última versão aplicada por NFT (`eventId` + `version`), para deduplicar
// entregas repetidas do mesmo evento e nunca regredir o estado se um evento
// antigo chegar fora de ordem (rule `realtime-socket.md`).
type LastApplied = { eventId: string; version: number }

export function useCartRealtime(cartNftIds: string[]) {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const cartNftIdsKey = cartNftIds.join(',')
  const lastAppliedByNftId = useRef(new Map<string, LastApplied>())

  useEffect(() => {
    function handleEvent(raw: unknown) {
      const parsed = realtimeEventSchema.safeParse(raw)
      if (!parsed.success || parsed.data.type !== 'nft.updated') return
      const { resource, eventId, version, data } = parsed.data
      if (!cartNftIdsKey.split(',').includes(resource.id)) return

      const lastApplied = lastAppliedByNftId.current.get(resource.id)
      if (lastApplied && (lastApplied.eventId === eventId || version <= lastApplied.version)) return
      lastAppliedByNftId.current.set(resource.id, { eventId, version })

      queryClient.setQueryData(queryKeys.nfts.detail(resource.id), data)
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.quote(user.id, '') }) // invalida toda cotação deste usuário
      toast.info('O preço ou a disponibilidade de um item do seu carrinho mudou.')
    }

    socket.on('event', handleEvent)
    return () => {
      socket.off('event', handleEvent)
    }
  }, [cartNftIdsKey, user, queryClient])
}
