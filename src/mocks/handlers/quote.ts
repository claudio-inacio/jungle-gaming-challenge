import { http, HttpResponse } from 'msw'
import {
  quoteRequestSchema,
  quoteSchema,
  type QuoteItem,
  type CouponStatus,
} from '@/shared/api/contracts/quote'
import { mulEth, sumEth, subEth, addEth } from '@/shared/lib/eth'
import Big from 'big.js'
import { db } from '../db/store'
import { withScenario, matchOverride } from '../scenarios/apply'
import { errorResponse } from './error-response'
import { fixtureCoupons } from '../fixtures/coupons'

// Taxa de rede fixa para o mock - não é regra do desafio, apenas simula um custo
// de rede constante para dar realismo ao resumo de cotação.
const NETWORK_FEE = '0.01'

export const quoteHandlers = [
  http.post('/api/quote', async ({ request }) =>
    withScenario(async () => {
      const body = quoteRequestSchema.parse(await request.json())

      const forced = matchOverride('POST', '/api/quote', { couponCode: body.couponCode })
      if (forced) return errorResponse(forced.status, forced.code, forced.message)

      const nfts = db.get().nfts

      const items: QuoteItem[] = body.items.map((requested) => {
        const nft = nfts.find((n) => n.id === requested.nftId)
        const unitPrice = nft?.price ?? '0'
        const available = nft?.available ?? 0
        const availability = !nft || requested.quantity > available ? 'sold_out' : 'ok'
        const subtotal = mulEth(unitPrice, requested.quantity)
        return {
          nftId: requested.nftId,
          quantity: requested.quantity,
          unitPrice,
          subtotal,
          availability,
        }
      })

      const subtotal = sumEth(items.map((item) => item.subtotal))

      let discount = '0'
      let couponStatus: CouponStatus = 'none'
      if (body.couponCode) {
        const coupon = fixtureCoupons[body.couponCode as keyof typeof fixtureCoupons]
        if (!coupon) {
          couponStatus = 'invalid'
        } else if (coupon.status === 'expired') {
          couponStatus = 'expired'
        } else {
          couponStatus = 'applied'
          discount = new Big(subtotal).times(coupon.discountPercent).div(100).toString()
        }
      }

      const networkFee = NETWORK_FEE
      const total = addEth(subEth(subtotal, discount), networkFee)

      return HttpResponse.json(
        quoteSchema.parse({
          items,
          subtotal,
          discount,
          networkFee,
          total,
          couponCode: body.couponCode ?? null,
          couponStatus,
          quotedAt: new Date().toISOString(),
        }),
      )
    }),
  ),
]
