import { Loader2 } from 'lucide-react'

export function SessionRestoreOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        className="mx-4 flex max-w-xs flex-col items-center gap-3 rounded-xl bg-card p-6 text-center text-foreground shadow-lg"
      >
        <Loader2 aria-hidden="true" className="size-8 motion-safe:animate-spin text-foreground" />
        <p className="text-base font-medium text-foreground">Restaurando sua sessão…</p>
        <p className="text-sm text-muted-foreground">Atualizando dados do usuário</p>
      </div>
    </div>
  )
}
