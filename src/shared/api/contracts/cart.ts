import { z } from 'zod'
import { ethAmountSchema, idSchema, isoDateSchema } from './common'

export const cartItemSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  editionLabel: z.enum(['1/1', '1/10', '1/50', 'open']),
  name: z.string(),
  tokenId: z.string(),
  // Caminho relativo em `public/img`, não URL absoluta - `.url()` quebraria.
  imageUrl: z.string().min(1),
  unitPrice: ethAmountSchema,
  quantity: z.number().int().min(1),
  available: z.number().int().min(0),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  // Cupom é do carrinho como um todo, não de cada linha.
  couponCode: z.string().nullable(),
  updatedAt: isoDateSchema,
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemRequestSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  quantity: z.number().int().min(1),
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>

// Linha identificada pela rota (`/cart/items/:nftId/:editionId`), não pelo corpo.
export const updateCartItemRequestSchema = z.object({
  quantity: z.number().int().min(1),
})
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>

export const mergeCartRequestSchema = z.object({
  items: z.array(
    z.object({
      nftId: idSchema,
      editionId: idSchema,
      quantity: z.number().int().min(1),
    }),
  ),
})
export type MergeCartRequest = z.infer<typeof mergeCartRequestSchema>

// `couponCode` string aplica; `null` remove.
export const applyCartCouponRequestSchema = z.object({
  couponCode: z.string().min(1).nullable(),
})
export type ApplyCartCouponRequest = z.infer<typeof applyCartCouponRequestSchema>
