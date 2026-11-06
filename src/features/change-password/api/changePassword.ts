import { useMutation } from '@tanstack/react-query'
import { http, type ChangePasswordRequest } from '@/shared/api'

async function changePasswordRequest(body: ChangePasswordRequest): Promise<void> {
  await http.patch('/profile/password', body)
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePasswordRequest })
}
