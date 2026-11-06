import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { User } from '@/shared/api'
import { applyApiFieldErrors } from '@/shared/lib/form'
import { useUpdateProfileMutation } from '../api/updateProfile'
import { profileFormSchema, type ProfileFormValues } from './profile-form-schema'

export function useEditProfileForm(user: User | null) {
  const mutation = useUpdateProfileMutation(user?.id)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: '', username: '', email: '' },
  })

  useEffect(() => {
    if (!user || form.formState.isDirty) return
    form.reset({ displayName: user.displayName, username: user.username, email: user.email })
  }, [user, form])

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset(values)
        toast.success('Perfil atualizado com sucesso.')
      },
      onError: (error) => {
        const mapped = applyApiFieldErrors(error, form.setError)
        if (!mapped) toast.error('Não foi possível atualizar o perfil.')
      },
    })
  })

  return { form, onSubmit, mutation }
}
