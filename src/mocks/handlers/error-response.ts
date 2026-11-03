import { HttpResponse } from 'msw'
import { apiErrorSchema, type ApiErrorCode } from '@/shared/api/contracts/error'

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string[]>,
) {
  const body = apiErrorSchema.parse({ error: { code, message, fields } })
  return HttpResponse.json(body, { status })
}
