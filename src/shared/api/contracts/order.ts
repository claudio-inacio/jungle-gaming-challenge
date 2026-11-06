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
// `editionId`/`editionLabel` identificam qual edição daquele NFT foi
// comprada - o recibo precisa mostrar isso, não só o NFT agregado.
export const orderItemSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  editionLabel: z.enum(['1/1', '1/10', '1/50', 'open']),
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
  declinedAt: isoDateSchema.nullable(),
})
export type Order = z.infer<typeof orderSchema>

// A chave de idempotência agora vai no header HTTP `Idempotency-Key`, não no
// corpo (ver `src/mocks/handlers/order.ts`).
export const createOrderRequestSchema = z.object({
  items: z
    .array(z.object({ nftId: idSchema, editionId: idSchema, quantity: z.number().int().min(1) }))
    .min(1),
  // `.nullable()`: `useCheckout.ts` sempre manda `couponCode` no corpo (nunca
  // omite a chave), com `null` quando o carrinho não tem cupom - igual ao
  // padrão já usado em `quoteRequestSchema`. Sem isso, toda criação de pedido
  // sem cupom falhava com 500 (ZodError não tratado como `ApiError`).
  couponCode: z.string().nullable().optional(),
  walletAddress: walletAddressSchema,
  network: networkSchema,
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>
