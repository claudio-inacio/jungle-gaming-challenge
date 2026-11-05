import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socket } from '@/shared/api/socket/client'
import { queryKeys } from '@/shared/api/query-keys'
import { realtimeEventSchema } from '@/shared/api/contracts/events'
import { useSession } from '@/entities/session'

export function useCartRealtime(cartNftIds: string[]) {
  const queryClient = useQueryClient()
  const { user } = useSession()

  useEffect(() => {
    function handleEvent(raw: unknown) {
      const parsed = realtimeEventSchema.safeParse(raw)
      if (!parsed.success || parsed.data.type !== 'nft.updated') return
      if (!cartNftIds.includes(parsed.data.resource.id)) return

      queryClient.setQueryData(queryKeys.nfts.detail(parsed.data.resource.id), parsed.data.data)
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.quote(user.id, '') }) // invalida toda cotação deste usuário
      toast.info('O preço ou a disponibilidade de um item do seu carrinho mudou.')
    }

    socket.on('event', handleEvent)
    return () => {
      socket.off('event', handleEvent)
    }
  }, [cartNftIds.join(','), user?.id])
}
