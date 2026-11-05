import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { loginRequestSchema, type LoginRequest, ApiError, http } from '@/shared/api'
import { login, startSession } from '@/entities/session'
import { guestCartStorage } from '@/entities/cart/model/guest-cart-storage'

export function useLoginForm(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (session) => {
      startSession(queryClient, session)

      const guestItems = guestCartStorage.get()
      if (guestItems.length > 0) {
        try {
          await http.post('/cart/merge', { items: guestItems })
          guestCartStorage.clear()
        } catch {
          // mantém o carrinho de visitante se o merge falhar, para tentar de novo depois
        }
      }
      toast.success(`Login realizado com sucesso! Bem-vindo, ${session.user.displayName}.`)
      navigate({ to: redirectTo ?? '/' })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        form.setError('password', { message: 'E-mail ou senha inválidos' })
      }
    },
  })

  return { form, onSubmit: form.handleSubmit((values) => mutation.mutate(values)), mutation }
}
