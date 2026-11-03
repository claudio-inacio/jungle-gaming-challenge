import { z } from 'zod'
import { ethAmountSchema, idSchema, isoDateSchema } from './common'

export const cartItemSchema = z.object({
  nftId: idSchema,
  tokenId: z.string(),
  name: z.string(),
  image: z.string().url(),
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
  quantity: z.number().int().min(1),
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>

export const updateCartItemRequestSchema = z.object({
  quantity: z.number().int().min(1),
})
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>
