import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/shared/api'

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): boolean {
  if (!(error instanceof ApiError) || !error.fields) return false

  let mappedAny = false
  for (const [field, messages] of Object.entries(error.fields)) {
    const message = messages[0]
    if (!message) continue
    setError(field as Path<TFieldValues>, { message })
    mappedAny = true
  }
  return mappedAny
}
