import { db } from '../db/store'

export interface MockSession {
  userId: string
  token: string
  expiresAt: string
}

/**
 * Resolve uma sessão a partir do token, revalidando expiração contra o `db`
 * no momento da chamada. Usada tanto pelos handlers HTTP (via
 * `getSessionFromRequest`) quanto pelo handshake e pela emissão de eventos do
 * socket - nunca cacheie um `userId` resolvido num momento anterior, porque
 * logout/expiração não teriam como invalidar esse cache.
 */
export function getSessionByToken(token: string | null | undefined): MockSession | null {
  if (!token) return null
  const session = db.get().sessions[token]
  if (!session || new Date(session.expiresAt) < new Date()) return null
  return { userId: session.userId, token, expiresAt: session.expiresAt }
}
