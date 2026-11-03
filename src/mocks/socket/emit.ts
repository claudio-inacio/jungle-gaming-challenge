import { realtimeEventSchema, type RealtimeEvent } from '@/shared/api/contracts/events'
import type { NftDetail } from '@/shared/api/contracts/nft'
import type { Order } from '@/shared/api/contracts/order'

type Emitter = (event: RealtimeEvent) => void

interface RegisteredEmitter {
  userId: string | null
  emit: Emitter
}

// Conjunto (não uma única referência) porque cada conexão WebSocket registra
// o seu próprio emissor em `socket/index.ts`; sem isso, uma segunda aba
// sobrescreveria a primeira. `userId` começa `null` (a conexão ainda não se
// identificou) e é atualizado depois do handshake `identify` - sem isso,
// `order.updated` não tem como saber pra qual conexão aquele pedido pertence.
const emitters = new Set<RegisteredEmitter>()

export function registerEmitter(fn: Emitter): {
  unregister: () => void
  setUserId: (userId: string | null) => void
} {
  const entry: RegisteredEmitter = { userId: null, emit: fn }
  emitters.add(entry)
  return {
    unregister: () => emitters.delete(entry),
    setUserId: (userId) => {
      entry.userId = userId
    },
  }
}

let versionCounter = 0

function nextVersion(): number {
  versionCounter += 1
  return versionCounter
}

/** Catálogo é dado público: toda conexão recebe. */
export function emitNftUpdated(nft: NftDetail): void {
  const event = realtimeEventSchema.parse({
    type: 'nft.updated',
    eventId: crypto.randomUUID(),
    version: nextVersion(),
    occurredAt: new Date().toISOString(),
    resource: { type: 'nft', id: nft.id },
    data: nft,
  } satisfies RealtimeEvent)
  for (const entry of emitters) entry.emit(event)
}

/** Pedido é dado privado: só entrega pra conexão(ões) já identificadas com o mesmo userId. */
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
    if (entry.userId === userId) entry.emit(event)
  }
}
