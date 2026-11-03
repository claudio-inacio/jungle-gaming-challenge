import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'
import { nftDetailSchema } from './nft'
import { orderSchema } from './order'

const baseEventSchema = z.object({
  eventId: idSchema,
  version: z.number().int().min(1),
  occurredAt: isoDateSchema,
})

export const nftUpdatedEventSchema = baseEventSchema.extend({
  type: z.literal('nft.updated'),
  resource: z.object({ type: z.literal('nft'), id: idSchema }),
  data: nftDetailSchema,
})

export const orderUpdatedEventSchema = baseEventSchema.extend({
  type: z.literal('order.updated'),
  resource: z.object({ type: z.literal('order'), id: idSchema }),
  userId: idSchema,
  data: orderSchema,
})

export const realtimeEventSchema = z.discriminatedUnion('type', [
  nftUpdatedEventSchema,
  orderUpdatedEventSchema,
])
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>
