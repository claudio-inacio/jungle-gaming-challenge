import { PendingLink } from '@/shared/ui/pending-link'

export function NoWalletsNotice() {
  return (
    <p>
      Nenhuma carteira cadastrada. <PendingLink>Cadastrar carteira</PendingLink>
    </p>
  )
}
