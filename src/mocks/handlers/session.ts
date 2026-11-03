import { db } from '../db/store'

export interface RequestSession {
  userId: string
  token: string
  expiresAt: string
}

/** Mesma checagem de `Authorization: Bearer <token>` usada em auth.ts, extraída
 * para não ser reimplementada (de forma inconsistente) em cada handler. */
export function getSessionFromRequest(request: Request): RequestSession | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const session = db.get().sessions[token]
  if (!session || new Date(session.expiresAt) < new Date()) return null
  return { userId: session.userId, token, expiresAt: session.expiresAt }
}
