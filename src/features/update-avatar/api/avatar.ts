import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http, profileSchema, queryKeys, type User } from '@/shared/api'

async function uploadAvatarRequest(file: File): Promise<User> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post('/profile/avatar', formData)
  return profileSchema.parse(data)
}

async function removeAvatarRequest(): Promise<User> {
  const { data } = await http.patch('/profile', { avatarUrl: null })
  return profileSchema.parse(data)
}

export function useUploadAvatarMutation(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadAvatarRequest,
    onSuccess: (updatedProfile) => {
      if (!userId) return
      queryClient.setQueryData(queryKeys.profile(userId), updatedProfile)
      queryClient.invalidateQueries({ queryKey: queryKeys.session() })
    },
  })
}

export function useRemoveAvatarMutation(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeAvatarRequest,
    onSuccess: (updatedProfile) => {
      if (!userId) return
      queryClient.setQueryData(queryKeys.profile(userId), updatedProfile)
      queryClient.invalidateQueries({ queryKey: queryKeys.session() })
    },
  })
}
