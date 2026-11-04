import { useLoginForm } from '../model/useLoginForm'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { form, onSubmit, mutation } = useLoginForm(redirectTo)
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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
          autoComplete="current-password"
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
      <Button type="submit" variant="pill" disabled={mutation.isPending}>
        {mutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
