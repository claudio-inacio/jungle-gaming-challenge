import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http, profileSchema, queryKeys, type UpdateProfileRequest, type User } from '@/shared/api'

async function updateProfile(body: UpdateProfileRequest): Promise<User> {
  const { data } = await http.patch('/profile', body)
  return profileSchema.parse(data)
}

export function useUpdateProfileMutation(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      if (!userId) return
      queryClient.setQueryData(queryKeys.profile(userId), updatedProfile)
      queryClient.invalidateQueries({ queryKey: queryKeys.session() })
    },
  })
}
