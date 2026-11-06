import { Loader2 } from 'lucide-react'
import { useEditProfileForm } from '../model/useEditProfileForm'
import type { User } from '@/shared/api'
import { Text } from '@/shared/ui/Text'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

const fieldClassName = 'h-10 w-full rounded-[3px]'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

export function EditProfileForm({ user }: { user: User | null }) {
  const { form, onSubmit, mutation } = useEditProfileForm(user)
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Text variant="body-bold" className="text-base">
        Dados do perfil
      </Text>

      <fieldset
        disabled={mutation.isPending}
        className="grid grid-cols-1 gap-x-7 gap-y-6 lg:grid-cols-2 lg:[&>*]:max-w-[417px]"
      >
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="displayName" className="text-[15px]">
            Nome de exibição
          </Label>
          <Input
            id="displayName"
            autoComplete="name"
            aria-invalid={!!formState.errors.displayName}
            aria-describedby="displayName-error"
            className={fieldClassName}
            {...register('displayName')}
          />
          <FieldError id="displayName-error" message={formState.errors.displayName?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="username" className="text-[15px]">
            Nome de usuário
          </Label>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={!!formState.errors.username}
            aria-describedby="username-error"
            className={fieldClassName}
            {...register('username')}
          />
          <FieldError id="username-error" message={formState.errors.username?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email" className="text-[15px]">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!formState.errors.email}
            aria-describedby="email-error"
            className={fieldClassName}
            {...register('email')}
          />
          <FieldError id="email-error" message={formState.errors.email?.message} />
        </div>
      </fieldset>

      <Button
        type="submit"
        variant="default"
        disabled={!formState.isDirty || mutation.isPending}
        aria-busy={mutation.isPending}
        className="h-10 w-fit min-w-[131px] self-end rounded-[3px] font-bold"
      >
        {mutation.isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        Salvar alterações
      </Button>
    </form>
  )
}
