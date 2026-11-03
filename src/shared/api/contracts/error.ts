import { z } from 'zod'

export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'AVAILABILITY_CONFLICT',
  'CONFLICT',
  'COUPON_INVALID',
  'COUPON_EXPIRED',
  'QUOTE_CHANGED',
  'TRANSIENT',
])
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
})
export type ApiErrorBody = z.infer<typeof apiErrorSchema>

export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  fields?: Record<string, string[]>
  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message)
    this.status = status
    this.code = body.error.code
    this.fields = body.error.fields
  }
}
