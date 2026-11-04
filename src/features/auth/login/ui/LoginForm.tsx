import { useLoginForm } from '../model/useLoginForm'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Button } from '@/shared/ui/button'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'
import { SocialAuthButtons } from '@/features/auth/ui/SocialAuthButtons'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { form, onSubmit, mutation } = useLoginForm(redirectTo)
  const { register, formState } = form

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email" className="sr-only">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="contato@email.com"
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
          autoComplete="current-password"
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
        <div className="mt-2 text-right">
          <OutOfScopeLink className="text-sm font-medium text-accent-foreground">
            Esqueceu a senha?
          </OutOfScopeLink>
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full font-bold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Entrando…' : 'Entrar'}
      </Button>

      <SocialAuthButtons />
    </form>
  )
}
