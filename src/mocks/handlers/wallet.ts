import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import {
  createWalletRequestSchema,
  updateWalletRequestSchema,
  walletSchema,
  type Wallet,
} from '@/shared/api/contracts/wallet'
import { db } from '../db/store'
import { matchOverride, withScenario } from '../scenarios/apply'
import { errorResponse, validationErrorResponse } from './error-response'
import { getSessionFromRequest } from './session'

const walletListSchema = z.array(walletSchema)

// `label` só existe a partir do v10 do `db/store.ts` (sem bump de `STORAGE_KEY`,
// já que o campo é opcional/nullable). Uma carteira persistida antes dessa
// mudança não tem a chave `label` no objeto em memória/`localStorage`; sem
// esse fallback, `walletSchema.parse()` (que exige `label: string | null`,
// não `undefined`) quebraria todo handler de carteira pra quem já tinha um
// DB persistido.
function getUserWallets(userId: string): Wallet[] {
  const wallets = db.get().wallets[userId] ?? []
  return wallets.map((wallet) => ({ ...wallet, label: wallet.label ?? null }))
}

export const walletHandlers = [
  http.get('/api/wallets', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      return HttpResponse.json(walletListSchema.parse(getUserWallets(session.userId)))
    }),
  ),

  http.post('/api/wallets', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const parsed = createWalletRequestSchema.safeParse(await request.json())
      if (!parsed.success) return validationErrorResponse(parsed.error)
      const body = parsed.data

      const existing = getUserWallets(session.userId)
      if (body.type === 'primary' && existing.some((w) => w.type === 'primary'))
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira primária cadastrada', {
          type: ['Já existe uma carteira primária cadastrada'],
        })
      if (body.type === 'secondary' && existing.some((w) => w.type === 'secondary'))
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira secundária cadastrada', {
          type: ['Já existe uma carteira secundária cadastrada'],
        })
      if (existing.some((w) => w.address === body.address))
        return errorResponse(409, 'CONFLICT', 'Endereço já cadastrado em outra carteira', {
          address: ['Endereço já cadastrado em outra carteira'],
        })

      const newWallet: Wallet = {
        id: crypto.randomUUID(),
        type: body.type,
        provider: body.provider,
        address: body.address,
        network: body.network,
        ensName: body.ensName ?? null,
        label: body.label ?? null,
        createdAt: new Date().toISOString(),
        isConnected: false,
      }

      db.update((d) => {
        const list = d.wallets[session.userId] ?? []
        list.push(newWallet)
        d.wallets[session.userId] = list
      })

      return HttpResponse.json(walletSchema.parse(newWallet), { status: 201 })
    }),
  ),

  http.patch('/api/wallets/:id', async ({ request, params }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const walletId = params.id as string
      const list = getUserWallets(session.userId)
      const target = list.find((w) => w.id === walletId)
      if (!target) return errorResponse(404, 'NOT_FOUND', 'Carteira não encontrada')

      const parsed = updateWalletRequestSchema.safeParse(await request.json())
      if (!parsed.success) return validationErrorResponse(parsed.error)
      const body = parsed.data

      if (
        body.type === 'primary' &&
        target.type !== 'primary' &&
        list.some((w) => w.type === 'primary')
      )
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira primária cadastrada', {
          type: ['Já existe uma carteira primária cadastrada'],
        })
      if (
        body.type === 'secondary' &&
        target.type !== 'secondary' &&
        list.some((w) => w.type === 'secondary')
      )
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira secundária cadastrada', {
          type: ['Já existe uma carteira secundária cadastrada'],
        })
      if (body.address && list.some((w) => w.id !== walletId && w.address === body.address))
        return errorResponse(409, 'CONFLICT', 'Endereço já cadastrado em outra carteira', {
          address: ['Endereço já cadastrado em outra carteira'],
        })

      db.update((d) => {
        const userWallets = d.wallets[session.userId] ?? []
        const wallet = userWallets.find((w) => w.id === walletId)
        if (wallet) Object.assign(wallet, body)
      })

      const updated = getUserWallets(session.userId).find((w) => w.id === walletId)!
      return HttpResponse.json(walletSchema.parse(updated))
    }),
  ),

  http.delete('/api/wallets/:id', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const walletId = params.id as string
      const list = getUserWallets(session.userId)
      const target = list.find((w) => w.id === walletId)
      if (!target) return errorResponse(404, 'NOT_FOUND', 'Carteira não encontrada')
      // Principal não pode ser excluída, só substituída (edição) ou trocada de
      // tipo com outra - a UI usa esse 409 pro toggle "igual à principal" na
      // carteira secundária, nunca na principal.
      if (target.type === 'primary')
        return errorResponse(409, 'CONFLICT', 'A carteira principal não pode ser excluída')

      db.update((d) => {
        d.wallets[session.userId] = (d.wallets[session.userId] ?? []).filter(
          (w) => w.id !== walletId,
        )
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ),

  http.post('/api/wallets/:id/connect', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const override = matchOverride('POST', '/api/wallets/:id/connect')
      if (override) return errorResponse(override.status, override.code, override.message)

      const walletId = params.id as string
      const list = getUserWallets(session.userId)
      if (!list.some((w) => w.id === walletId))
        return errorResponse(404, 'NOT_FOUND', 'Carteira não encontrada')

      // Só uma carteira fica conectada por usuário - conectar uma desconecta
      // qualquer outra que já estivesse conectada.
      db.update((d) => {
        const userWallets = d.wallets[session.userId] ?? []
        for (const wallet of userWallets) {
          wallet.isConnected = wallet.id === walletId
        }
      })

      const connected = getUserWallets(session.userId).find((w) => w.id === walletId)!
      return HttpResponse.json(walletSchema.parse(connected))
    }),
  ),

  http.post('/api/wallets/:id/disconnect', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const walletId = params.id as string
      const list = getUserWallets(session.userId)
      const target = list.find((w) => w.id === walletId)
      if (!target) return errorResponse(404, 'NOT_FOUND', 'Carteira não encontrada')

      db.update((d) => {
        const userWallets = d.wallets[session.userId] ?? []
        const wallet = userWallets.find((w) => w.id === walletId)
        if (wallet) wallet.isConnected = false
      })

      const disconnected = getUserWallets(session.userId).find((w) => w.id === walletId)!
      return HttpResponse.json(walletSchema.parse(disconnected))
    }),
  ),
]
