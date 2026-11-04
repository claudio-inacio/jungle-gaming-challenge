import { http, HttpResponse } from 'msw'
import Big from 'big.js'
import { createOrderRequestSchema, orderSchema, type Order } from '@/shared/api/contracts/order'
import { addEth, mulEth, subEth, sumEth } from '@/shared/lib/eth'
import { db } from '../db/store'
import { matchOverride, withScenario } from '../scenarios/apply'
import { getActiveScenario } from '../scenarios/registry'
import { errorResponse } from './error-response'
import { hashPassword } from '../lib/password'
import { getSessionFromRequest } from './session'
import { fixtureCoupons } from '../fixtures/coupons'
import { emitNftUpdated, emitOrderUpdated } from '../socket/emit'

// Taxa de rede fixa e determinística para a simulação (não vem de nenhuma
// cotação de gas real).
const NETWORK_FEE = '0.01'

// Tempo simulado de "processamento do pagamento" entre o pedido nascer
// `pending` (resposta do POST) e a confirmação/recusa assíncrona chegar via
// `order.updated` - nunca síncrono com a criação, senão a tela de
// confirmação nunca dependeria de verdade do evento em tempo real.
const ORDER_RESOLUTION_DELAY_MS = 1200

/**
 * Resolve um pedido `pending` pra `confirmed`/`declined` de forma assíncrona
 * e emite `order.updated` nesse momento. Estoque só é consumido aqui (na
 * confirmação de verdade) - nunca na criação, pra um pedido ainda pendente
 * (ou recusado) não travar disponibilidade que outro comprador poderia usar.
 * No cenário `order-timeout` esta função nunca é agendada: o pedido
 * permanece `pending` indefinidamente, de propósito.
 */
function resolveOrder(orderId: string, userId: string, scenarioId: string): void {
  const nextStatus: Order['status'] = scenarioId === 'payment-declined' ? 'declined' : 'confirmed'

  db.update((d) => {
    const stored = (d.orders[userId] ?? []).find((o) => o.id === orderId)
    // Idempotente: só resolve um pedido que ainda está pending (evita
    // reaplicar a transição se `resolveOrder` for chamado mais de uma vez).
    if (!stored || stored.status !== 'pending') return

    stored.status = nextStatus
    if (nextStatus === 'confirmed') {
      stored.transactionId = crypto.randomUUID()
      stored.confirmedAt = new Date().toISOString()
      for (const item of stored.items) {
        const nft = d.nfts.find((n) => n.id === item.nftId)
        if (nft) nft.available = Math.max(0, nft.available - item.quantity)
      }
    } else {
      stored.declineReason = 'Pagamento recusado pela carteira'
    }
  })

  const resolvedOrder = db.get().orders[userId]?.find((o) => o.id === orderId)
  if (!resolvedOrder) return

  emitOrderUpdated(resolvedOrder, userId)
  if (resolvedOrder.status === 'confirmed') {
    for (const item of resolvedOrder.items) {
      const updatedNft = db.get().nfts.find((n) => n.id === item.nftId)
      if (updatedNft) emitNftUpdated(updatedNft)
    }
  }
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const idempotencyKey = request.headers.get('Idempotency-Key')
      if (!idempotencyKey)
        return errorResponse(400, 'VALIDATION_ERROR', 'Header Idempotency-Key é obrigatório')

      const body = createOrderRequestSchema.parse(await request.json())
      const bodyHash = await hashPassword(JSON.stringify(body))

      const existingKey = db.get().idempotencyKeys[idempotencyKey]
      if (existingKey) {
        // Chave já usada por OUTRO usuário: nunca reaproveitar/retornar o pedido
        // de outra conta, mesmo que o corpo bata por coincidência.
        if (existingKey.userId !== session.userId)
          return errorResponse(409, 'CONFLICT', 'Idempotency-Key já usada')

        if (existingKey.bodyHash !== bodyHash)
          return errorResponse(409, 'CONFLICT', 'Idempotency-Key já usada com corpo diferente')

        const existingOrder = db
          .get()
          .orders[existingKey.userId]?.find((o) => o.id === existingKey.orderId)
        if (existingOrder)
          return HttpResponse.json(orderSchema.parse(existingOrder), { status: 201 })
      }

      // Permite que cenários (`quote-changed`, `edition-sold-out`) forcem um
      // conflito de disponibilidade/preço de forma determinística antes de
      // revalidar os itens contra o estado real do catálogo.
      const override = matchOverride('POST', '/api/orders', { couponCode: body.couponCode })
      if (override) return errorResponse(override.status, override.code, override.message)

      const nfts = db.get().nfts
      const items: Order['items'] = []
      for (const item of body.items) {
        const nft = nfts.find((n) => n.id === item.nftId)
        if (!nft) return errorResponse(404, 'NOT_FOUND', `NFT ${item.nftId} não encontrado`)
        if (item.quantity > nft.available)
          return errorResponse(
            409,
            'AVAILABILITY_CONFLICT',
            `Apenas ${nft.available} unidade(s) disponível(is) para ${nft.name}`,
          )

        items.push({
          nftId: nft.id,
          tokenId: nft.tokenId,
          name: nft.name,
          image: nft.image,
          unitPrice: nft.price,
          quantity: item.quantity,
          subtotal: mulEth(nft.price, item.quantity),
        })
      }

      const subtotal = sumEth(items.map((item) => item.subtotal))

      let discount = '0'
      if (body.couponCode) {
        const coupon = fixtureCoupons[body.couponCode as keyof typeof fixtureCoupons]
        if (!coupon) return errorResponse(422, 'COUPON_INVALID', 'Cupom inválido')
        if (coupon.status === 'expired')
          return errorResponse(422, 'COUPON_EXPIRED', 'Cupom expirado')
        discount = new Big(subtotal).times(coupon.discountPercent).div(100).toString()
      }

      const total = addEth(subEth(subtotal, discount), NETWORK_FEE)

      const scenario = getActiveScenario()
      const createdAt = new Date().toISOString()
      const order: Order = {
        id: crypto.randomUUID(),
        idempotencyKey,
        status: 'pending',
        items,
        subtotal,
        discount,
        networkFee: NETWORK_FEE,
        total,
        walletAddress: body.walletAddress,
        network: body.network,
        transactionId: null,
        declineReason: null,
        createdAt,
        confirmedAt: null,
      }

      // O pedido nasce `pending`: a confirmação/recusa é sempre assíncrona
      // (ver `resolveOrder`), nunca decidida aqui na resposta do POST.
      db.update((d) => {
        const list = d.orders[session.userId] ?? []
        list.push(order)
        d.orders[session.userId] = list
        d.idempotencyKeys[idempotencyKey] = { userId: session.userId, orderId: order.id, bodyHash }
      })

      emitOrderUpdated(order, session.userId)

      // `order-timeout` simula o processamento nunca terminar: o pedido fica
      // `pending` indefinidamente, de propósito.
      if (scenario.id !== 'order-timeout') {
        setTimeout(
          () => resolveOrder(order.id, session.userId, scenario.id),
          ORDER_RESOLUTION_DELAY_MS,
        )
      }

      return HttpResponse.json(orderSchema.parse(order), { status: 201 })
    }),
  ),

  http.get('/api/orders/:id', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const id = params.id as string
      const order = (db.get().orders[session.userId] ?? []).find((o) => o.id === id)
      if (!order) return errorResponse(404, 'NOT_FOUND', 'Pedido não encontrado')

      return HttpResponse.json(orderSchema.parse(order))
    }),
  ),
]
