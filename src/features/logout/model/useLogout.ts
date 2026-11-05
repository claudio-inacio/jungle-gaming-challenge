import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { logoutRequest, tokenStorage } from '@/entities/session'
import { socket } from '@/shared/api'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      tokenStorage.clear()
      socket.disconnect()
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
}
