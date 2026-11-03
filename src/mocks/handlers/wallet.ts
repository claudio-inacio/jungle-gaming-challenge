import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import {
  createWalletRequestSchema,
  updateWalletRequestSchema,
  walletSchema,
  type Wallet,
} from '@/shared/api/contracts/wallet'
import { db } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { getSessionFromRequest } from './session'

const walletListSchema = z.array(walletSchema)

export const walletHandlers = [
  http.get('/api/wallets', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const wallets = db.get().wallets[session.userId] ?? []
      return HttpResponse.json(walletListSchema.parse(wallets))
    }),
  ),

  http.post('/api/wallets', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = createWalletRequestSchema.parse(await request.json())
      const existing = db.get().wallets[session.userId] ?? []
      if (body.type === 'primary' && existing.some((w) => w.type === 'primary'))
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira primária cadastrada')

      const newWallet: Wallet = {
        id: crypto.randomUUID(),
        type: body.type,
        provider: body.provider,
        address: body.address,
        network: body.network,
        ensName: body.ensName ?? null,
        createdAt: new Date().toISOString(),
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
      const list = db.get().wallets[session.userId] ?? []
      const target = list.find((w) => w.id === walletId)
      if (!target) return errorResponse(404, 'NOT_FOUND', 'Carteira não encontrada')

      const body = updateWalletRequestSchema.parse(await request.json())
      if (
        body.type === 'primary' &&
        target.type !== 'primary' &&
        list.some((w) => w.type === 'primary')
      )
        return errorResponse(409, 'CONFLICT', 'Já existe uma carteira primária cadastrada')

      db.update((d) => {
        const userWallets = d.wallets[session.userId] ?? []
        const wallet = userWallets.find((w) => w.id === walletId)
        if (wallet) Object.assign(wallet, body)
      })

      const updated = (db.get().wallets[session.userId] ?? []).find((w) => w.id === walletId)!
      return HttpResponse.json(walletSchema.parse(updated))
    }),
  ),
]
