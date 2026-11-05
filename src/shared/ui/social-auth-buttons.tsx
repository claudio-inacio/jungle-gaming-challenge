import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { FacebookIcon, GoogleIcon } from './social-icons'

function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        Ou continue com
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <OutOfScopeButton variant="outline" size="lg" className="w-full gap-2">
        <GoogleIcon className="size-4" />
        Continuar com Google
      </OutOfScopeButton>
      <OutOfScopeButton variant="outline" size="lg" className="w-full gap-2">
        <FacebookIcon className="size-4" />
        Continuar com Facebook
      </OutOfScopeButton>
    </div>
  )
}

export { SocialAuthButtons }
