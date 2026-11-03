import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { RealtimeEvent } from '@/shared/api/contracts/events'
import { registerEmitter } from './emit'
import { db } from '../db/store'

const realtime = ws.link('wss://realtime.kurio.local/*')

export const socketHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)

    const { unregister, setUserId } = registerEmitter((event: RealtimeEvent) => {
      io.client.emit(event.type, event)
    })
    connection.client.addEventListener('close', unregister)

    // Handshake mínimo: o cliente emite `identify` com o `accessToken` da sessão
    // HTTP logo após conectar, pra esta conexão passar a receber `order.updated`
    // (dado privado - sem isso `emitOrderUpdated` nunca entrega nada aqui).
    io.client.on('identify', (_event, payload: unknown) => {
      const token =
        typeof payload === 'object' && payload !== null && 'token' in payload
          ? (payload as { token?: unknown }).token
          : undefined
      const session = typeof token === 'string' ? db.get().sessions[token] : undefined
      setUserId(session ? session.userId : null)
    })

    // `toSocketIo` agenda o handshake inicial (pacotes "open"/"connect") via
    // microtask; emitir no mesmo tick entrega o evento fora de ordem e o
    // cliente o descarta. Agendar depois garante a ordem correta.
    queueMicrotask(() => {
      io.client.emit('system.ready', { at: new Date().toISOString() })
    })
  }),
]
