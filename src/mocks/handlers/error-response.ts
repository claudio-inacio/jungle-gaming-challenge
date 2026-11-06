import { HttpResponse } from 'msw'
import { z } from 'zod'
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

export function validationErrorResponse(zodError: z.ZodError, message = 'Dados inválidos') {
  const { fieldErrors } = z.flattenError(zodError) as {
    fieldErrors: Record<string, string[] | undefined>
  }
  const fields: Record<string, string[]> = {}
  for (const [key, errors] of Object.entries(fieldErrors)) {
    if (errors && errors.length > 0) fields[key] = errors
  }
  return errorResponse(422, 'VALIDATION_ERROR', message, fields)
}
