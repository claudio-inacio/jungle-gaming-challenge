import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { registerRequestSchema, ApiError } from '@/shared/api'
import { register, startSession } from '@/entities/session'

const registerFormSchema = registerRequestSchema
  .extend({ confirmPassword: z.string().min(1, 'Confirme sua senha') })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
type RegisterFormValues = z.infer<typeof registerFormSchema>

export function useRegisterForm(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      startSession(queryClient, session)
      navigate({ to: redirectTo ?? '/' })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'CONFLICT') {
        form.setError('email', { message: 'E-mail ou usuário já cadastrados' })
      }
    },
  })

  return {
    form,
    onSubmit: form.handleSubmit(({ username, email, password }) =>
      mutation.mutate({ username, email, password }),
    ),
    mutation,
  }
}
