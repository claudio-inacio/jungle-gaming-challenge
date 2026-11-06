import { queryOptions } from '@tanstack/react-query'
import { http, queryKeys, quoteSchema, type CartItem } from '@/shared/api'

function hashQuoteInput(items: CartItem[], couponCode: string | null) {
  return JSON.stringify({ items: items.map((i) => [i.nftId, i.editionId, i.quantity]), couponCode })
}

export function quoteQuery({
  items,
  couponCode,
  userId,
}: {
  items: CartItem[]
  couponCode: string | null
  userId: string | undefined
}) {
  const hash = hashQuoteInput(items, couponCode)
  return queryOptions({
    queryKey: queryKeys.quote.detail(userId ?? 'guest', hash),
    queryFn: async ({ signal }) => {
      const { data } = await http.post(
        '/quote',
        {
          items: items.map((i) => ({
            nftId: i.nftId,
            editionId: i.editionId,
            quantity: i.quantity,
          })),
          couponCode,
        },
        { signal },
      )
      return quoteSchema.parse(data)
    },
    enabled: items.length > 0,
  })
}
