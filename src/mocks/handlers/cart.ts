import { http, HttpResponse } from 'msw'
import {
  addCartItemRequestSchema,
  applyCartCouponRequestSchema,
  cartSchema,
  mergeCartRequestSchema,
  updateCartItemRequestSchema,
  type CartItem,
} from '@/shared/api/contracts/cart'
import { db } from '../db/store'
import { withScenario, matchOverride } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { getSessionFromRequest } from './session'
import { fixtureCoupons } from '../fixtures/coupons'

/**
 * Preço, nome, imagem e disponibilidade nunca ficam congelados no carrinho -
 * o carrinho guarda só `{ nftId, editionId, quantity }` e esta função busca o
 * estado ATUAL do catálogo a cada resposta. Linhas cujo NFT ou edição não
 * existem mais são removidas silenciosamente (do db e da resposta) em vez de
 * quebrar a request.
 */
function buildCart(userId: string): {
  items: CartItem[]
  couponCode: string | null
  updatedAt: string
} {
  const entries = db.get().carts[userId] ?? []
  const nfts = db.get().nfts
  const items: CartItem[] = []
  let hasStaleEntry = false

  for (const entry of entries) {
    const nft = nfts.find((n) => n.id === entry.nftId)
    const edition = nft?.editions.find((e) => e.id === entry.editionId)
    if (!nft || !edition) {
      hasStaleEntry = true
      continue
    }
    items.push({
      nftId: nft.id,
      editionId: edition.id,
      editionLabel: edition.label,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image,
      unitPrice: edition.price,
      quantity: entry.quantity,
      available: edition.available,
    })
  }

  if (hasStaleEntry) {
    db.update((d) => {
      d.carts[userId] = entries.filter((entry) => {
        const nft = nfts.find((n) => n.id === entry.nftId)
        return nft?.editions.some((e) => e.id === entry.editionId) ?? false
      })
    })
  }

  return {
    items,
    couponCode: db.get().cartCoupons[userId] ?? null,
    updatedAt: new Date().toISOString(),
  }
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
  //
  // Uma linha é identificada por `nftId` + `editionId` juntos: o mesmo NFT em
  // edições diferentes é uma edição de produto diferente (preço e
  // disponibilidade próprios), então vira uma segunda linha, não soma na
  // existente.
  http.post('/api/cart/items', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = addCartItemRequestSchema.parse(await request.json())
      const nft = db.get().nfts.find((n) => n.id === body.nftId)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      const edition = nft.editions.find((e) => e.id === body.editionId)
      if (!edition) return errorResponse(404, 'NOT_FOUND', 'Edição não encontrada para este NFT')

      const entries = db.get().carts[session.userId] ?? []
      const existing = entries.find((e) => e.nftId === body.nftId && e.editionId === body.editionId)
      const nextQuantity = (existing?.quantity ?? 0) + body.quantity

      // Checa contra a disponibilidade da edição específica, não do NFT
      // agregado - agora que a edição é conhecida, é a checagem correta
      // (duas edições do mesmo NFT têm estoques independentes).
      if (nextQuantity > edition.available)
        return errorResponse(
          409,
          'AVAILABILITY_CONFLICT',
          `Apenas ${edition.available} unidade(s) disponível(is) para esta edição`,
        )

      db.update((d) => {
        const list = d.carts[session.userId] ?? []
        const entry = list.find((e) => e.nftId === body.nftId && e.editionId === body.editionId)
        if (entry) {
          entry.quantity = nextQuantity
        } else {
          list.push({ nftId: body.nftId, editionId: body.editionId, quantity: body.quantity })
        }
        d.carts[session.userId] = list
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  http.patch('/api/cart/items/:nftId/:editionId', async ({ request, params }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const nftId = params.nftId as string
      const editionId = params.editionId as string
      const body = updateCartItemRequestSchema.parse(await request.json())

      const entries = db.get().carts[session.userId] ?? []
      const entry = entries.find((e) => e.nftId === nftId && e.editionId === editionId)
      if (!entry) return errorResponse(404, 'NOT_FOUND', 'Item não encontrado no carrinho')

      const nft = db.get().nfts.find((n) => n.id === nftId)
      if (!nft) return errorResponse(404, 'NOT_FOUND', 'NFT não encontrado')

      const edition = nft.editions.find((e) => e.id === editionId)
      if (!edition) return errorResponse(404, 'NOT_FOUND', 'Edição não encontrada para este NFT')

      if (body.quantity > edition.available)
        return errorResponse(
          409,
          'AVAILABILITY_CONFLICT',
          `Apenas ${edition.available} unidade(s) disponível(is) para esta edição`,
        )

      db.update((d) => {
        const list = d.carts[session.userId] ?? []
        const target = list.find((e) => e.nftId === nftId && e.editionId === editionId)
        if (target) target.quantity = body.quantity
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  http.delete('/api/cart/items/:nftId/:editionId', async ({ request, params }) =>
    withScenario(() => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const nftId = params.nftId as string
      const editionId = params.editionId as string

      db.update((d) => {
        d.carts[session.userId] = (d.carts[session.userId] ?? []).filter(
          (e) => !(e.nftId === nftId && e.editionId === editionId),
        )
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ),

  // Mescla o carrinho de visitante (localStorage) no carrinho do usuário após
  // o login. Itens cujo NFT/edição não existe mais no catálogo são ignorados
  // silenciosamente (dado de visitante pode estar desatualizado) em vez de
  // falhar a request inteira. Diferente de POST /api/cart/items: aqui a
  // quantidade resultante é SATURADA no `available` da edição em vez de
  // rejeitar com 409 - a intenção é nunca perder o carrinho autenticado por
  // causa de um excesso trazido do visitante.
  http.post('/api/cart/merge', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = mergeCartRequestSchema.parse(await request.json())
      const nfts = db.get().nfts

      db.update((d) => {
        const list = d.carts[session.userId] ?? []
        for (const item of body.items) {
          const nft = nfts.find((n) => n.id === item.nftId)
          const edition = nft?.editions.find((e) => e.id === item.editionId)
          if (!nft || !edition) continue

          const entry = list.find((e) => e.nftId === item.nftId && e.editionId === item.editionId)
          if (entry) {
            entry.quantity = Math.min(entry.quantity + item.quantity, edition.available)
          } else {
            list.push({
              nftId: item.nftId,
              editionId: item.editionId,
              quantity: Math.min(item.quantity, edition.available),
            })
          }
        }
        d.carts[session.userId] = list
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),

  http.patch('/api/cart/coupon', async ({ request }) =>
    withScenario(async () => {
      const session = getSessionFromRequest(request)
      if (!session) return errorResponse(401, 'UNAUTHORIZED', 'Sessão expirada ou inexistente')

      const body = applyCartCouponRequestSchema.parse(await request.json())

      const forced = matchOverride('PATCH', '/api/cart/coupon', { couponCode: body.couponCode })
      if (forced) return errorResponse(forced.status, forced.code, forced.message)

      if (body.couponCode === null) {
        db.update((d) => {
          d.cartCoupons[session.userId] = null
        })
        return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
      }

      const coupon = fixtureCoupons[body.couponCode as keyof typeof fixtureCoupons]
      if (!coupon) return errorResponse(422, 'COUPON_INVALID', 'Cupom inválido')
      if (coupon.status === 'expired') return errorResponse(422, 'COUPON_EXPIRED', 'Cupom expirado')

      db.update((d) => {
        d.cartCoupons[session.userId] = body.couponCode
      })

      return HttpResponse.json(cartSchema.parse(buildCart(session.userId)))
    }),
  ),
]
