import { z } from 'zod'
import { networkSchema, walletAddressSchema, walletProviderSchema } from '@/shared/api'

export const walletFormSchema = z.object({
  label: z.string().min(1, 'Informe um apelido para a carteira').optional().or(z.literal('')),
  provider: walletProviderSchema,
  network: networkSchema,
  address: walletAddressSchema,
  ensName: z
    .string()
    .regex(/^[a-z0-9-]+\.eth$/, 'Nome ENS inválido (use o formato nome.eth)')
    .optional()
    .or(z.literal('')),
})
export type WalletFormValues = z.infer<typeof walletFormSchema>
