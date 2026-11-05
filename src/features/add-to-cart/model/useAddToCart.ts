import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { http, queryKeys } from '@/shared/api'
import { useSession } from '@/entities/session'
import { useNavigate } from '@tanstack/react-router'

export function useAddToCart() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useSession()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (body: { nftId: string; editionId: string; quantity: number }) => {
      if (!isAuthenticated) {
        navigate({ to: '/login', search: { redirect: location.pathname } })
        throw new Error('redirect-to-login')
      }
      const { data } = await http.post('/cart/items', body)
      return data
    },
    onSuccess: () => {
      if (!user) return
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(user.id) })
      toast.success('Adicionado ao carrinho')
    },
    onError: (error) => {
      if (error.message === 'redirect-to-login') return
      toast.error('Não foi possível adicionar ao carrinho. Tente novamente.')
    },
  })
}
