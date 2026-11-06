import { z } from 'zod'
import { networkSchema, walletAddressSchema } from './common'
import { userSchema } from './session'
import { walletTypeSchema } from './wallet'

// Perfil do colecionador preenchido no checkout - não é o mesmo recurso que
// `profileSchema` (conta/usuário): `email`/`displayName` aqui reaproveitam o
// mesmo formato de `userSchema` (mesma validação `.email()`), mas o restante
// (rede, carteira, indicação) é específico do fluxo de pagamento.
export const collectorProfileSchema = z.object({
  displayName: z.string().min(1),
  username: z.string().min(3).max(24),
  network: networkSchema,
  walletAddress: walletAddressSchema,
  ensName: z.string().nullable().optional(),
  walletType: walletTypeSchema,
  referralCode: z.string().optional(),
  email: userSchema.shape.email,
})
export type CollectorProfile = z.infer<typeof collectorProfileSchema>
