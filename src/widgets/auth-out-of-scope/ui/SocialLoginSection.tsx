import { OutOfScopeButton, OutOfScopeLink } from '@/shared/ui/out-of-scope'

const SOCIAL_PROVIDERS = ['Google', 'Facebook'] as const

function SocialLoginSection() {
  return (
    <div className="flex w-full flex-col items-center gap-3 pt-6">
      <div className="flex w-full items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border-soft" />
        <p className="text-sm text-foreground">Ou continue com</p>
        <span aria-hidden="true" className="h-px flex-1 bg-border-soft" />
      </div>

      <div className="flex w-full flex-col gap-3">
        {SOCIAL_PROVIDERS.map((provider) => (
          <OutOfScopeButton
            key={provider}
            variant="outline"
            className="h-10 w-full justify-center border-border bg-transparent text-[13px] font-medium text-muted-foreground hover:bg-muted"
          >
            Continuar com {provider}
          </OutOfScopeButton>
        ))}
      </div>
    </div>
  )
}

function ForgotPasswordLink() {
  return <OutOfScopeLink className="text-sm text-foreground">Esqueceu a senha?</OutOfScopeLink>
}

export { ForgotPasswordLink, SocialLoginSection }
