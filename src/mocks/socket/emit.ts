import { realtimeEventSchema, type RealtimeEvent } from '@/shared/api/contracts/events'
import type { NftDetail } from '@/shared/api/contracts/nft'
import type { Order } from '@/shared/api/contracts/order'
import { getSessionByToken } from '../lib/session'

type Emitter = (event: RealtimeEvent) => void

interface RegisteredEmitter {
  token: string | null
  emit: Emitter
}

// Conjunto (não uma única referência) porque cada conexão WebSocket registra
// o seu próprio emissor em `socket/index.ts`; sem isso, uma segunda aba
// sobrescreveria a primeira. Guardamos o `token` (não um `userId` já
// resolvido) porque o dono daquele token pode mudar com o tempo - logout
// apaga a sessão do `db`, sessão expira - e um `userId` cacheado nunca
// saberia disso. `emitOrderUpdated` revalida o token contra o `db` a cada
// envio, então uma conexão esquecida (sem desconectar no logout) para de
// receber pedidos do usuário anterior assim que a sessão dele some.
const emitters = new Set<RegisteredEmitter>()

export function registerEmitter(fn: Emitter): {
  unregister: () => void
  setToken: (token: string | null) => void
} {
  const entry: RegisteredEmitter = { token: null, emit: fn }
  emitters.add(entry)
  return {
    unregister: () => emitters.delete(entry),
    setToken: (token) => {
      entry.token = token
    },
  }
}

let versionCounter = 0

function nextVersion(): number {
  versionCounter += 1
  return versionCounter
}

/**
 * `favorited` é relativo a cada usuário (quem favoritou o quê), então nunca
 * pode viajar num evento de broadcast como `nft.updated` - cada conexão
 * continua resolvendo o próprio `favorited` via REST/cache local.
 */
function toPublicNft(nft: NftDetail): Omit<NftDetail, 'favorited'> {
  const publicNft: Partial<NftDetail> = { ...nft }
  delete publicNft.favorited
  return publicNft as Omit<NftDetail, 'favorited'>
}

/** Catálogo é dado público: toda conexão recebe. */
export function emitNftUpdated(nft: NftDetail): void {
  const event = realtimeEventSchema.parse({
    type: 'nft.updated',
    eventId: crypto.randomUUID(),
    version: nextVersion(),
    occurredAt: new Date().toISOString(),
    resource: { type: 'nft', id: nft.id },
    data: toPublicNft(nft),
  } satisfies RealtimeEvent)
  for (const entry of emitters) entry.emit(event)
}

/**
 * Pedido é dado privado: só entrega pra conexão(ões) cujo token identificado
 * ainda resolve, *no momento do envio*, pro mesmo `userId` dono do pedido.
 * Isso cobre tanto token expirado quanto logout (sessão apagada do `db`)
 * acontecidos depois do handshake `identify`.
 */
export function emitOrderUpdated(order: Order, userId: string): void {
  const event = realtimeEventSchema.parse({
    type: 'order.updated',
    eventId: crypto.randomUUID(),
    version: nextVersion(),
    occurredAt: new Date().toISOString(),
    resource: { type: 'order', id: order.id },
    userId,
    data: order,
  } satisfies RealtimeEvent)
  for (const entry of emitters) {
    if (!entry.token) continue
    const session = getSessionByToken(entry.token)
    if (session?.userId === userId) entry.emit(event)
  }
}
