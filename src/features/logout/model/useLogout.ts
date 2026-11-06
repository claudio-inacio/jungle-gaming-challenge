import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logoutRequest, endSession } from '@/entities/session'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      await endSession(queryClient)
      navigate({ to: '/' })
      toast.success('Você saiu da sua conta.')
    },
  })
}
