import { Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

type LogoutDialogProps = {
  open: boolean
  userName?: string
}

export function LogoutDialog({ open, userName }: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="flex flex-col items-center gap-6 py-10">
        <DialogHeader>
          <DialogTitle className="sr-only">Saindo da conta</DialogTitle>
        </DialogHeader>
        <p role="status" aria-live="polite" className="text-center text-base text-foreground">
          Até mais{userName ? `, ${userName}` : ''}... realizando logout
        </p>
        <Loader2Icon aria-hidden="true" className="size-8 animate-spin text-primary" />
      </DialogContent>
    </Dialog>
  )
}
