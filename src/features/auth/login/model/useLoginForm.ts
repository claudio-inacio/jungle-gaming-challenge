import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { loginRequestSchema } from '@/shared/api/contracts/session'
import { login } from '@/entities/session'
import { tokenStorage } from '@/entities/session'
import { setAccessToken } from '@/shared/api/http'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/error'

export function useLoginForm(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setAccessToken(session.accessToken)
      tokenStorage.set(session.accessToken)
      queryClient.setQueryData(queryKeys.session(), session)
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
