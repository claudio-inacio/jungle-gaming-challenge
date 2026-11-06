import { http, HttpResponse } from 'msw'
import {
  loginRequestSchema,
  registerRequestSchema,
  sessionSchema,
  type User,
} from '@/shared/api/contracts/session'
import { db, type MockUser } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { hashPassword, verifyPassword } from '../lib/password'
import { getSessionFromRequest } from './session'

export function toPublicUser(user: MockUser): User {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    ensName: user.ensName ?? null,
    createdAt: user.createdAt,
  }
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) =>
    withScenario(async () => {
      const body = loginRequestSchema.parse(await request.json())
      const user = db.get().users.find((u) => u.email === body.email)
      const hash = user
        ? (user.passwordHash ?? (user.password ? await hashPassword(user.password) : null))
        : null
      if (!user || !hash || !(await verifyPassword(body.password, hash)))
        return errorResponse(401, 'UNAUTHORIZED', 'E-mail ou senha inválidos')

      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString()
      db.update((d) => {
        d.sessions[token] = { userId: user.id, expiresAt }
      })

      return HttpResponse.json(
        sessionSchema.parse({
          user: toPublicUser(user),
          accessToken: token,
          expiresAt,
        }),
      )
    }),
  ),

  http.post('/api/auth/register', async ({ request }) =>
    withScenario(async () => {
      const body = registerRequestSchema.parse(await request.json())
      const exists = db
        .get()
        .users.some((u) => u.email === body.email || u.username === body.username)
      if (exists) return errorResponse(409, 'CONFLICT', 'E-mail ou usuário já cadastrados')

      const newUser: MockUser = {
        id: crypto.randomUUID(),
        email: body.email,
        username: body.username,
        displayName: body.username,
        createdAt: new Date().toISOString(),
        passwordHash: await hashPassword(body.password),
      }
      db.update((d) => {
        d.users.push(newUser)
      })

      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString()
      db.update((d) => {
        d.sessions[token] = { userId: newUser.id, expiresAt }
      })

      return HttpResponse.json(
        sessionSchema.parse({
          user: toPublicUser(newUser),
          accessToken: token,
          expiresAt,
        }),
        { status: 201 },
      )
    }),
  ),

  http.get('/api/auth/session', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')
      const user = db.get().users.find((u) => u.id === session.userId)!
      return HttpResponse.json(
        sessionSchema.parse({
          user: toPublicUser(user),
          accessToken: session.token,
          expiresAt: session.expiresAt,
        }),
      )
    }),
  ),

  http.post('/api/auth/logout', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (session)
        db.update((d) => {
          delete d.sessions[session.token]
        })
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
