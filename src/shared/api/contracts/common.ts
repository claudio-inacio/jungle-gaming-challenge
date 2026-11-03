import { z } from 'zod'

export const ethAmountSchema = z.string().regex(/^\d+(\.\d+)?$/, 'Invalid ETH amount')
export const isoDateSchema = z.string().datetime()
export const idSchema = z.string().min(1)
export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  })
