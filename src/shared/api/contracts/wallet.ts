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
  // Apelido livre dado pelo usuário à carteira (ex. "Carteira principal"),
  // exibido em Perfil e em Carteiras - distinto do `ensName` (identidade on-chain).
  label: z.string().nullable(),
  createdAt: isoDateSchema,
  // Só uma carteira por usuário fica conectada por vez - conectar uma marca as demais como desconectadas.
  isConnected: z.boolean(),
})
export type Wallet = z.infer<typeof walletSchema>

const ensNameRequestSchema = z
  .string()
  .regex(/^[a-z0-9-]+\.eth$/, 'Nome ENS inválido (use o formato nome.eth)')

export const createWalletRequestSchema = z.object({
  type: walletTypeSchema,
  provider: walletProviderSchema,
  address: walletAddressSchema,
  network: networkSchema,
  ensName: ensNameRequestSchema.nullable().optional(),
  label: z.string().min(1, 'Informe um apelido para a carteira').nullable().optional(),
})
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>

export const updateWalletRequestSchema = createWalletRequestSchema.partial()
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>
