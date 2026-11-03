import type { Scenario } from './types'

const successScenario: Scenario = {
  id: 'success',
  description: 'Caminho feliz, sem latência extra',
}

export const scenarios: Record<string, Scenario> = {
  success: successScenario,
  'slow-network': {
    id: 'slow-network',
    description: 'Latência de 800–2000ms em toda request',
    networkLatencyMs: [800, 2000],
  },
  offline: {
    id: 'offline',
    description: 'Toda request falha como erro de rede',
    forceOffline: true,
  },
  'coupon-invalid': {
    id: 'coupon-invalid',
    description: 'Cupom KURIO10 (normalmente válido) responde COUPON_INVALID em /quote e /orders',
    overrides: {
      'POST /api/quote': {
        status: 422,
        code: 'COUPON_INVALID',
        message: 'Cupom inválido',
        when: { couponCode: 'KURIO10' },
      },
      'POST /api/orders': {
        status: 422,
        code: 'COUPON_INVALID',
        message: 'Cupom inválido',
        when: { couponCode: 'KURIO10' },
      },
    },
  },
  'coupon-expired': {
    id: 'coupon-expired',
    description: 'Cupom KURIO10 (normalmente válido) responde COUPON_EXPIRED em /quote e /orders',
    overrides: {
      'POST /api/quote': {
        status: 422,
        code: 'COUPON_EXPIRED',
        message: 'Cupom expirado',
        when: { couponCode: 'KURIO10' },
      },
      'POST /api/orders': {
        status: 422,
        code: 'COUPON_EXPIRED',
        message: 'Cupom expirado',
        when: { couponCode: 'KURIO10' },
      },
    },
  },
  'payment-declined': {
    id: 'payment-declined',
    description: 'Pedido criado nasce com status declined (pagamento recusado pela carteira)',
  },
  'order-timeout': {
    id: 'order-timeout',
    description: 'Pedido criado fica pending indefinidamente (simula timeout na confirmação)',
  },
  'quote-changed': {
    id: 'quote-changed',
    description: 'Toda criação de pedido falha com QUOTE_CHANGED (preço mudou desde a cotação)',
    overrides: {
      'POST /api/orders': {
        status: 409,
        code: 'QUOTE_CHANGED',
        message: 'A cotação mudou, revise o pedido antes de confirmar',
      },
    },
  },
  'edition-sold-out': {
    id: 'edition-sold-out',
    description: 'Toda criação de pedido falha com AVAILABILITY_CONFLICT (edição esgotada)',
    overrides: {
      'POST /api/orders': {
        status: 409,
        code: 'AVAILABILITY_CONFLICT',
        message: 'Edição esgotada',
      },
    },
  },
}

const STORAGE_KEY = 'kurio-mocks-scenario'

export function getActiveScenario(): Scenario {
  if (typeof window === 'undefined') return successScenario

  const fromUrl = new URLSearchParams(window.location.search).get('scenario')
  const id = fromUrl ?? window.localStorage.getItem(STORAGE_KEY) ?? 'success'
  if (fromUrl) window.localStorage.setItem(STORAGE_KEY, fromUrl)
  return scenarios[id] ?? successScenario
}
