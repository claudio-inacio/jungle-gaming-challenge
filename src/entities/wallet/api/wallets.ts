import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { http, queryKeys, walletSchema } from '@/shared/api'

const walletListSchema = z.array(walletSchema)

export function walletsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.wallets(userId ?? 'guest'),
    queryFn: async ({ signal }) => {
      const { data } = await http.get('/wallets', { signal })
      return walletListSchema.parse(data)
    },
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
  })
}
