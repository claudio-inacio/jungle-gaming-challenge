import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { loginRequestSchema, type LoginRequest } from '@/shared/api/contracts/session'
import { login, tokenStorage } from '@/entities/session'
import { setAccessToken } from '@/shared/api/http'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/error'

export function useLoginForm(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setAccessToken(session.accessToken)
      tokenStorage.set(session.accessToken)
      queryClient.setQueryData(queryKeys.session(), session)
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
