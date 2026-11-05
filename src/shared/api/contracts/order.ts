import { z } from 'zod'
import {
  ethAmountSchema,
  idSchema,
  isoDateSchema,
  networkSchema,
  walletAddressSchema,
} from './common'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

// Snapshot do pedido: nunca recalcular com dados ao vivo do catálogo.
export const orderItemSchema = z.object({
  nftId: idSchema,
  tokenId: z.string(),
  name: z.string(),
  image: z.string().min(1),
  unitPrice: ethAmountSchema,
  quantity: z.number().int().min(1),
  subtotal: ethAmountSchema,
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = z.object({
  id: idSchema,
  idempotencyKey: z.string().min(1),
  status: orderStatusSchema,
  items: z.array(orderItemSchema),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  walletAddress: walletAddressSchema,
  network: networkSchema,
  transactionId: z.string().nullable(),
  declineReason: z.string().nullable(),
  createdAt: isoDateSchema,
  confirmedAt: isoDateSchema.nullable(),
})
export type Order = z.infer<typeof orderSchema>

// A chave de idempotência agora vai no header HTTP `Idempotency-Key`, não no
// corpo (ver `src/mocks/handlers/order.ts`).
export const createOrderRequestSchema = z.object({
  items: z.array(z.object({ nftId: idSchema, quantity: z.number().int().min(1) })).min(1),
  couponCode: z.string().optional(),
  walletAddress: walletAddressSchema,
  network: networkSchema,
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>
