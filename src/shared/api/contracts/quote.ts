import { z } from 'zod'
import { ethAmountSchema, idSchema, isoDateSchema } from './common'

export const quoteItemAvailabilitySchema = z.enum(['ok', 'sold_out', 'price_changed'])
export type QuoteItemAvailability = z.infer<typeof quoteItemAvailabilitySchema>

export const quoteItemSchema = z.object({
  nftId: idSchema,
  quantity: z.number().int().min(1),
  unitPrice: ethAmountSchema,
  subtotal: ethAmountSchema,
  availability: quoteItemAvailabilitySchema,
})
export type QuoteItem = z.infer<typeof quoteItemSchema>

export const couponStatusSchema = z.enum(['none', 'applied', 'invalid', 'expired'])
export type CouponStatus = z.infer<typeof couponStatusSchema>

export const quoteSchema = z.object({
  items: z.array(quoteItemSchema),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  couponCode: z.string().nullable(),
  couponStatus: couponStatusSchema,
  quotedAt: isoDateSchema,
})
export type Quote = z.infer<typeof quoteSchema>

export const applyCouponRequestSchema = z.object({
  couponCode: z.string().min(1),
})
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>

export const quoteRequestItemSchema = z.object({
  nftId: idSchema,
  quantity: z.number().int().min(1),
})
export type QuoteRequestItem = z.infer<typeof quoteRequestItemSchema>

export const quoteRequestSchema = z.object({
  items: z.array(quoteRequestItemSchema).min(1),
  couponCode: z.string().min(1).nullable().optional(),
})
export type QuoteRequest = z.infer<typeof quoteRequestSchema>
