import { http, HttpResponse } from 'msw'
import {
  addCartItemRequestSchema,
  cartSchema,
  updateCartItemRequestSchema,
  type CartItem,
} from '@/shared/api/contracts/cart'
import { db } from '../db/store'
import { withScenario } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { getSessionFromRequest } from './session'

/**
 * Preço, nome, imagem e disponibilidade nunca ficam congelados no carrinho -
 * o carrinho guarda só `{ nftId, quantity }` e esta função busca o estado
 * ATUAL do catálogo a cada resposta. Linhas cujo NFT não existe mais são
 * removidas silenciosamente (do db e da resposta) em vez de quebrar a request.
 */
function buildCart(userId: string): { items: CartItem[]; updatedAt: string } {
  const entries = db.get().carts[userId] ?? []
  const nfts = db.get().nfts
  const items: CartItem[] = []
  let hasStaleEntry = false

  for (const entry of entries) {
    const nft = nfts.find((n) => n.id === entry.nftId)
    if (!nft) {
      hasStaleEntry = true
      continue
    }
    items.push({
      nftId: nft.id,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image,
      unitPrice: nft.price,
      quantity: entry.quantity,
      available: nft.available,
    })
  }

  if (hasStaleEntry) {
    db.update((d) => {
      d.carts[userId] = entries.filter((entry) => nfts.some((n) => n.id === entry.nftId))
    })
  }

  return { items, updatedAt: new Date().toISOString() }
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  // Upsert: soma à linha existente em vez de duplicar. Como o resultado é o
  // estado do carrinho (agregado), e não necessariamente um recurso novo (o
  // item pode já existir e só ter a quantidade incrementada), a resposta é
  // 200 com o `cartSchema` completo - mesmo padrão de PATCH/DELETE - em vez
  // de um 201 que sugeriria sempre criação de uma linha nova.
  http.post('/api/cart/items', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = addCartItemRequestSchema.parse(await request.json())
      const nft = db.get().nfts.find((n) => n.id === body.nftId)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      const entries = db.get().carts[session.userId] ?? []
      const existing = entries.find((e) => e.nftId === body.nftId)
      const nextQuantity = (existing?.quantity ?? 0) + body.quantity

      if (nextQuantity > nft.available)
        return errorResponse(
          409,
          'AVAILABILITY_CONFLICT',
          `Apenas ${nft.available} unidade(s) disponível(is) para este NFT`,
        )

      db.update((d) => {
        const list = d.carts[session.userId] ?? []
        const entry = list.find((e) => e.nftId === body.nftId)
        if (entry) {
          entry.quantity = nextQuantity
        } else {
          list.push({ nftId: body.nftId, quantity: body.quantity })
        }
        d.carts[session.userId] = list
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  http.patch('/api/cart/items/:nftId', async ({ request, params }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const nftId = params.nftId as string
      const body = updateCartItemRequestSchema.parse(await request.json())

      const entries = db.get().carts[session.userId] ?? []
      const entry = entries.find((e) => e.nftId === nftId)
      if (!entry) return errorResponse(404, 'NOT_FOUND', 'Item não encontrado no carrinho')

      const nft = db.get().nfts.find((n) => n.id === nftId)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      if (body.quantity > nft.available)
        return errorResponse(
          409,
          'AVAILABILITY_CONFLICT',
          `Apenas ${nft.available} unidade(s) disponível(is) para este NFT`,
        )

      db.update((d) => {
        const list = d.carts[session.userId] ?? []
        const target = list.find((e) => e.nftId === nftId)
        if (target) target.quantity = body.quantity
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  http.delete('/api/cart/items/:nftId', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const nftId = params.nftId as string
      db.update((d) => {
        d.carts[session.userId] = (d.carts[session.userId] ?? []).filter((e) => e.nftId !== nftId)
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
