import { http, HttpResponse } from 'msw'
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_BYTES,
  changePasswordRequestSchema,
  profileSchema,
  updateProfileRequestSchema,
} from '@/shared/api/contracts/profile'
import { db } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse, validationErrorResponse } from './error-response'
import { hashPassword, verifyPassword } from '../lib/password'
import { getSessionFromRequest } from './session'
import { toPublicUser } from './auth'

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:${file.type};base64,${btoa(binary)}`
}

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

      const parsed = updateProfileRequestSchema.safeParse(await request.json())
      if (!parsed.success) return validationErrorResponse(parsed.error)
      const body = parsed.data

      const emailTaken = db
        .get()
        .users.some((u) => u.id !== session.userId && body.email && u.email === body.email)
      const usernameTaken = db
        .get()
        .users.some((u) => u.id !== session.userId && body.username && u.username === body.username)
      if (emailTaken || usernameTaken) {
        const fields: Record<string, string[]> = {}
        if (emailTaken) fields.email = ['E-mail já cadastrado']
        if (usernameTaken) fields.username = ['Usuário já cadastrado']
        return errorResponse(409, 'CONFLICT', 'E-mail ou usuário já cadastrados', fields)
      }

      db.update((d) => {
        const user = d.users.find((u) => u.id === session.userId)
        if (user) Object.assign(user, body)
      })

      const updated = db.get().users.find((u) => u.id === session.userId)!
      return HttpResponse.json(profileSchema.parse(toPublicUser(updated)))
    }),
  ),

  // Senha atual incorreta responde 422 VALIDATION_ERROR com `fields.currentPassword`,
  // e não 401 - um 401 é interpretado por `shared/api/http.ts` como sessão expirada
  // (zera o token e dispara `session:expired`, mandando o usuário pro /login), mas
  // aqui a sessão continua válida: só o valor digitado no campo está errado.
  http.patch('/api/profile/password', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const parsed = changePasswordRequestSchema.safeParse(await request.json())
      if (!parsed.success) return validationErrorResponse(parsed.error)
      const body = parsed.data

      const user = db.get().users.find((u) => u.id === session.userId)!
      const hash = user.passwordHash ?? (user.password ? await hashPassword(user.password) : null)
      if (!hash || !(await verifyPassword(body.currentPassword, hash)))
        return errorResponse(422, 'VALIDATION_ERROR', 'Senha atual incorreta', {
          currentPassword: ['Senha atual incorreta'],
        })

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

  // Não há storage real: a imagem é convertida para data URL e persiste no
  // `db` serializado em `localStorage` junto do resto do estado - por isso o
  // limite de 512 KB (cota do `localStorage`, tipicamente 5-10 MB no total,
  // compartilhada com catálogo, pedidos, etc).
  http.post('/api/profile/avatar', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const formData = await request.formData()
      const file = formData.get('file')
      if (!(file instanceof File))
        return errorResponse(422, 'VALIDATION_ERROR', 'Avatar inválido', {
          file: ['Envie um arquivo de imagem'],
        })

      if (!AVATAR_ACCEPTED_TYPES.includes(file.type as (typeof AVATAR_ACCEPTED_TYPES)[number]))
        return errorResponse(422, 'VALIDATION_ERROR', 'Avatar inválido', {
          file: ['Formato de imagem não suportado (use PNG, JPEG ou WebP)'],
        })
      if (file.size > AVATAR_MAX_BYTES)
        return errorResponse(422, 'VALIDATION_ERROR', 'Avatar inválido', {
          file: ['Imagem muito grande (máximo 512 KB)'],
        })

      const dataUrl = await fileToDataUrl(file)
      db.update((d) => {
        const user = d.users.find((u) => u.id === session.userId)
        if (user) user.avatarUrl = dataUrl
      })

      const updated = db.get().users.find((u) => u.id === session.userId)!
      return HttpResponse.json(profileSchema.parse(toPublicUser(updated)))
    }),
  ),
]
