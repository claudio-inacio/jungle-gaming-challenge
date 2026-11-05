import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http, queryKeys } from '@/shared/api'
import { useSession } from '@/entities/session'

export function useApplyCoupon() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: async (couponCode: string | null) => {
      await http.patch('/cart/coupon', { couponCode })
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: queryKeys.cart(user.id) })
    },
    // erro tratado no componente via mutation.error instanceof ApiError (COUPON_INVALID / COUPON_EXPIRED)
  })
}
