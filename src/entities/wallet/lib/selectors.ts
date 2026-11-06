import type { Wallet } from '@/shared/api'

export function selectPrimaryWallet(wallets: Wallet[]): Wallet | null {
  return wallets.find((wallet) => wallet.type === 'primary') ?? null
}

export function selectSecondaryWallet(wallets: Wallet[]): Wallet | null {
  return wallets.find((wallet) => wallet.type === 'secondary') ?? null
}
