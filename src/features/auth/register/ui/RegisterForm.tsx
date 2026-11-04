import { useRegisterForm } from '../model/useRegisterForm'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const { form, onSubmit, mutation } = useRegisterForm(redirectTo)
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <Label htmlFor="username">Usuário</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          aria-invalid={!!formState.errors.username}
          aria-describedby="username-error"
          {...register('username')}
        />
        {formState.errors.username && (
          <p id="username-error" role="alert" className="text-sm text-destructive mt-1">
            {formState.errors.username.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!formState.errors.email}
          aria-describedby="email-error"
          {...register('email')}
        />
        {formState.errors.email && (
          <p id="email-error" role="alert" className="text-sm text-destructive mt-1">
            {formState.errors.email.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!formState.errors.password}
          aria-describedby="password-error"
          {...register('password')}
        />
        {formState.errors.password && (
          <p id="password-error" role="alert" className="text-sm text-destructive mt-1">
            {formState.errors.password.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!formState.errors.confirmPassword}
          aria-describedby="confirmPassword-error"
          {...register('confirmPassword')}
        />
        {formState.errors.confirmPassword && (
          <p id="confirmPassword-error" role="alert" className="text-sm text-destructive mt-1">
            {formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" variant="pill" disabled={mutation.isPending}>
        {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  )
}
