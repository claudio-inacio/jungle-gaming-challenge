import { z } from 'zod'
import { ethAmountSchema, idSchema, isoDateSchema } from './common'

export const cartItemSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  editionLabel: z.enum(['1/1', '1/10', '1/50', 'open']), // exibido no card mobile: "Edição: 1/50"
  name: z.string(),
  tokenId: z.string(),
  // Mesmo padrão de `nftSummarySchema`/`orderSchema.image` (caminho relativo em
  // `public/img`, não URL absoluta) - `.url()` quebraria com o dado real do catálogo.
  image: z.string().min(1),
  unitPrice: ethAmountSchema,
  quantity: z.number().int().min(1),
  available: z.number().int().min(0),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  updatedAt: isoDateSchema,
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemRequestSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  quantity: z.number().int().min(1),
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>

export const updateCartItemRequestSchema = z.object({
  editionId: idSchema,
  quantity: z.number().int().min(1),
})
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>

// DELETE não tem corpo; a edição vem na querystring para identificar a linha
// sem ambiguidade (uma linha agora é `nftId` + `editionId`, não só `nftId`).
export const removeCartItemQuerySchema = z.object({
  editionId: idSchema,
})
export type RemoveCartItemQuery = z.infer<typeof removeCartItemQuerySchema>
