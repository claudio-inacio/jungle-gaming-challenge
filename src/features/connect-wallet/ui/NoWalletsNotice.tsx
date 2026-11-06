import { Link } from '@tanstack/react-router'

export function NoWalletsNotice() {
  return (
    <p>
      Nenhuma carteira cadastrada.{' '}
      <Link to="/wallets" className="font-bold text-accent-foreground hover:underline">
        Cadastrar carteira
      </Link>
    </p>
  )
}
