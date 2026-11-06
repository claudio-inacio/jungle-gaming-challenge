import { Loader2 } from 'lucide-react'
import { useChangePasswordForm } from '../model/useChangePasswordForm'
import { Text } from '@/shared/ui/Text'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
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

export function ChangePasswordForm() {
  const { form, onSubmit, mutation } = useChangePasswordForm()
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <Text variant="body-bold" className="text-base">
        Alterar senha
      </Text>

      <fieldset disabled={mutation.isPending} className="flex max-w-[417px] flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="currentPassword" className="text-[15px]">
            Senha atual
          </Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            aria-invalid={!!formState.errors.currentPassword}
            aria-describedby="currentPassword-error"
            className={fieldClassName}
            {...register('currentPassword')}
          />
          <FieldError
            id="currentPassword-error"
            message={formState.errors.currentPassword?.message}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="newPassword" className="text-[15px]">
            Nova senha
          </Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            aria-invalid={!!formState.errors.newPassword}
            aria-describedby="newPassword-error"
            className={fieldClassName}
            {...register('newPassword')}
          />
          <FieldError id="newPassword-error" message={formState.errors.newPassword?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="confirmNewPassword" className="text-[15px]">
            Confirmar nova senha
          </Label>
          <PasswordInput
            id="confirmNewPassword"
            autoComplete="new-password"
            aria-invalid={!!formState.errors.confirmNewPassword}
            aria-describedby="confirmNewPassword-error"
            className={fieldClassName}
            {...register('confirmNewPassword')}
          />
          <FieldError
            id="confirmNewPassword-error"
            message={formState.errors.confirmNewPassword?.message}
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        variant="default"
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
        className="h-10 w-fit min-w-[131px] self-end rounded-[3px] font-bold"
      >
        {mutation.isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        Alterar senha
      </Button>
    </form>
  )
}
