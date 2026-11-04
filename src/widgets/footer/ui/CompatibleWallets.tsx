type CompatibleWalletsProps = {
  wallets: string[]
}

function CompatibleWallets({ wallets }: CompatibleWalletsProps) {
  return (
    <div className="inline-flex w-fit items-center rounded-4xl border border-border-soft bg-muted px-2 py-1 text-[9px] font-bold tracking-[0.1px] text-accent-foreground uppercase">
      <ul className="inline-flex items-center gap-1">
        {wallets.map((wallet, index) => (
          <li key={wallet} className="inline-flex items-center gap-1">
            {wallet}
            {index < wallets.length - 1 && <span aria-hidden="true">·</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { CompatibleWallets }
export type { CompatibleWalletsProps }
