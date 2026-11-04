import { getSessionByToken, type MockSession } from '../lib/session'

export type RequestSession = MockSession

/** Mesma checagem de `Authorization: Bearer <token>` usada em auth.ts, extraída
 * para não ser reimplementada (de forma inconsistente) em cada handler.
 * Revalida expiração via `getSessionByToken`, a mesma função usada pelo
 * handshake e pela emissão privada do socket. */
export function getSessionFromRequest(request: Request): RequestSession | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  return getSessionByToken(token)
}
