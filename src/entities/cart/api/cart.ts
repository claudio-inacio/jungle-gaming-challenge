import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { http, cartSchema, queryKeys } from '@/shared/api'
import { useSession } from '@/entities/session/@x/cart'
import { guestCartStorage } from '../model/guest-cart-storage'

export function cartQuery(userId: string) {
  return queryOptions({
    queryKey: queryKeys.cart(userId),
    queryFn: async ({ signal }) => {
      const { data } = await http.get('/cart', { signal })
      return cartSchema.parse(data)
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: async (body: { nftId: string; editionId: string; quantity: number }) => {
      if (!user) {
        const items = guestCartStorage.get()
        const idx = items.findIndex((i) => i.nftId === body.nftId && i.editionId === body.editionId)
        if (body.quantity <= 0) {
          if (idx >= 0) items.splice(idx, 1)
        } else if (idx >= 0) {
          const item = items[idx]
          if (item) item.quantity = body.quantity
          else items.push(body)
        } else {
          items.push(body)
        }
        guestCartStorage.set(items)
        return
      }
      if (body.quantity <= 0) {
        await http.delete(`/cart/items/${body.nftId}/${body.editionId}`)
      } else {
        await http.patch(`/cart/items/${body.nftId}/${body.editionId}`, { quantity: body.quantity })
      }
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.cart(user.id) })
    },
  })
}
