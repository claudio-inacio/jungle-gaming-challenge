import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http, queryKeys, type NftSummary } from '@/shared/api'
import { useSession } from '@/entities/session'

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: async ({ nftId, nextValue }: { nftId: string; nextValue: boolean }) => {
      if (nextValue) await http.post('/favorites', { nftId })
      else await http.delete(`/favorites/${nftId}`)
    },

    onMutate: async ({ nftId, nextValue }) => {
      if (!user) return // sem sessão, o botão nem deveria chamar a mutation (ver FavoriteButton)

      await queryClient.cancelQueries({ queryKey: queryKeys.nfts.detail(nftId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites(user.id) })

      const previousDetail = queryClient.getQueryData<NftSummary>(queryKeys.nfts.detail(nftId))
      const previousFavorites = queryClient.getQueryData<string[]>(queryKeys.favorites(user.id))

      queryClient.setQueryData<NftSummary>(queryKeys.nfts.detail(nftId), (old) =>
        old ? { ...old, isFavorited: nextValue } : old,
      )
      queryClient.setQueryData<string[]>(queryKeys.favorites(user.id), (old = []) =>
        nextValue ? [...old, nftId] : old.filter((id) => id !== nftId),
      )

      return { previousDetail, previousFavorites }
    },

    onError: (_err, { nftId }, context) => {
      if (!user || !context) return
      // rollback exato: devolve o estado anterior, não um "oposto" calculado
      queryClient.setQueryData(queryKeys.nfts.detail(nftId), context.previousDetail)
      queryClient.setQueryData(queryKeys.favorites(user.id), context.previousFavorites)
    },

    onSettled: (_data, _error, { nftId }) => {
      if (!user) return
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.detail(nftId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites(user.id) })
    },
  })
}
