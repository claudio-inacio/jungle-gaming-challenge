import { z } from 'zod'
import { idSchema, isoDateSchema, networkSchema, walletAddressSchema } from './common'

export const walletTypeSchema = z.enum(['primary', 'secondary'])
export type WalletType = z.infer<typeof walletTypeSchema>

export const walletProviderSchema = z.enum(['metamask', 'wallet_connect', 'coinbase'])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const walletSchema = z.object({
  id: idSchema,
  type: walletTypeSchema,
  provider: walletProviderSchema,
  address: walletAddressSchema,
  network: networkSchema,
  ensName: z.string().nullable(),
  createdAt: isoDateSchema,
  // Só uma carteira por usuário fica conectada por vez - conectar uma marca
  // as demais como desconectadas (ver `POST /api/wallets/:id/connect`).
  isConnected: z.boolean(),
})
export type Wallet = z.infer<typeof walletSchema>

export const createWalletRequestSchema = z.object({
  type: walletTypeSchema,
  provider: walletProviderSchema,
  address: walletAddressSchema,
  network: networkSchema,
  ensName: z.string().nullable().optional(),
})
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>

export const updateWalletRequestSchema = createWalletRequestSchema.partial()
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>
