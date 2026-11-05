import { useRegisterForm } from '../model/useRegisterForm'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Button } from '@/shared/ui/button'
import { SocialAuthButtons } from '@/shared/ui/social-auth-buttons'

type RegisterFormProps = {
  redirectTo?: string
  submitLabel?: string
}

export function RegisterForm({ redirectTo, submitLabel = 'Criar conta' }: RegisterFormProps) {
  const { form, onSubmit, mutation } = useRegisterForm(redirectTo)
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <Label htmlFor="username" className="sr-only">
          Nome de usuário
        </Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Nome de usuário"
          aria-invalid={!!formState.errors.username}
          aria-describedby="username-error"
          {...register('username')}
        />
        {formState.errors.username && (
          <p id="username-error" role="alert" className="mt-1 text-sm text-destructive">
            {formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="sr-only">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          aria-invalid={!!formState.errors.email}
          aria-describedby="email-error"
          {...register('email')}
        />
        {formState.errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-destructive">
            {formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="sr-only">
          Senha
        </Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Senha"
          aria-invalid={!!formState.errors.password}
          aria-describedby="password-error"
          {...register('password')}
        />
        {formState.errors.password && (
          <p id="password-error" role="alert" className="mt-1 text-sm text-destructive">
            {formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="sr-only">
          Confirmar senha
        </Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirmar senha"
          aria-invalid={!!formState.errors.confirmPassword}
          aria-describedby="confirmPassword-error"
          {...register('confirmPassword')}
        />
        {formState.errors.confirmPassword && (
          <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-destructive">
            {formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full font-bold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Criando…' : submitLabel}
      </Button>

      <SocialAuthButtons />
    </form>
  )
}
