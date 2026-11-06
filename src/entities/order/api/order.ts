import { queryOptions } from '@tanstack/react-query'
import { http, queryKeys, orderSchema } from '@/shared/api'

export function orderDetailQuery(userId: string | undefined, orderId: string) {
  return queryOptions({
    queryKey: queryKeys.orders.detail(userId ?? 'guest', orderId),
    queryFn: async ({ signal }) => {
      const { data } = await http.get(`/orders/${orderId}`, { signal })
      return orderSchema.parse(data)
    },
    enabled: Boolean(userId) && Boolean(orderId),
  })
}
