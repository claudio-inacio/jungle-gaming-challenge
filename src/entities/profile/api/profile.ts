import { queryOptions } from '@tanstack/react-query'
import { http, queryKeys, profileSchema } from '@/shared/api'

export function profileQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.profile(userId ?? 'guest'),
    queryFn: async ({ signal }) => {
      const { data } = await http.get('/profile', { signal })
      return profileSchema.parse(data)
    },
    enabled: Boolean(userId),
  })
}
