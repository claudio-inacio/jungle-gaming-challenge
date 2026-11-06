import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { applyApiFieldErrors } from '@/shared/lib/form'
import { useChangePasswordMutation } from '../api/changePassword'
import { changePasswordFormSchema, type ChangePasswordFormValues } from './password-form-schema'

export function useChangePasswordForm() {
  const mutation = useChangePasswordMutation()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  })

  const onSubmit = form.handleSubmit(({ currentPassword, newPassword }) => {
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          form.reset()
          toast.success('Senha alterada com sucesso.')
        },
        onError: (error) => {
          const mapped = applyApiFieldErrors(error, form.setError)
          if (!mapped) toast.error('Não foi possível alterar a senha.')
        },
      },
    )
  })

  return { form, onSubmit, mutation }
}
