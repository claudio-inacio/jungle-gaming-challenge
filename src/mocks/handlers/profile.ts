import { http, HttpResponse } from 'msw'
import {
  changePasswordRequestSchema,
  profileSchema,
  updateProfileRequestSchema,
} from '@/shared/api/contracts/profile'
import { db } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { hashPassword, verifyPassword } from '../lib/password'
import { getSessionFromRequest } from './session'
import { toPublicUser } from './auth'

export const profileHandlers = [
  http.get('/api/profile', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const user = db.get().users.find((u) => u.id === session.userId)!
      return HttpResponse.json(profileSchema.parse(toPublicUser(user)))
    }),
  ),

  http.patch('/api/profile', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = updateProfileRequestSchema.parse(await request.json())

      const conflict = db
        .get()
        .users.some(
          (u) =>
            u.id !== session.userId &&
            ((body.email && u.email === body.email) ||
              (body.username && u.username === body.username)),
        )
      if (conflict) return errorResponse(409, 'CONFLICT', 'E-mail ou usuário já cadastrados')

      db.update((d) => {
        const user = d.users.find((u) => u.id === session.userId)
        if (user) Object.assign(user, body)
      })

      const updated = db.get().users.find((u) => u.id === session.userId)!
      return HttpResponse.json(profileSchema.parse(toPublicUser(updated)))
    }),
  ),

  // Senha atual incorreta responde 401 UNAUTHORIZED (mesma semântica do login:
  // credencial inválida), e não 422 - o corpo é estruturalmente válido, só a
  // credencial está errada.
  http.patch('/api/profile/password', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = changePasswordRequestSchema.parse(await request.json())
      const user = db.get().users.find((u) => u.id === session.userId)!
      const hash = user.passwordHash ?? (user.password ? await hashPassword(user.password) : null)
      if (!hash || !(await verifyPassword(body.currentPassword, hash)))
        return errorResponse(401, 'UNAUTHORIZED', 'Senha atual incorreta')

      const newHash = await hashPassword(body.newPassword)
      db.update((d) => {
        const target = d.users.find((u) => u.id === session.userId)
        if (target) {
          target.passwordHash = newHash
          delete target.password
        }
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
