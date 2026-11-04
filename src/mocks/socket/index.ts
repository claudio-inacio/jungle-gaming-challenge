import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { RealtimeEvent } from '@/shared/api/contracts/events'
import { registerEmitter } from './emit'
import { getSessionByToken } from '../lib/session'

const realtime = ws.link('wss://realtime.kurio.local/*')

export const socketHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)

    const { unregister, setToken } = registerEmitter((event: RealtimeEvent) => {
      io.client.emit(event.type, event)
    })
    connection.client.addEventListener('close', unregister)

    // Handshake mínimo: o cliente emite `identify` com o `accessToken` da sessão
    // HTTP logo após conectar, pra esta conexão passar a receber `order.updated`
    // (dado privado - sem isso `emitOrderUpdated` nunca entrega nada aqui).
    // `getSessionByToken` já rejeita token inexistente/expirado aqui; e como
    // `emitOrderUpdated` revalida de novo a cada envio, logout ou expiração
    // depois deste handshake também passam a bloquear a entrega, sem precisar
    // de um passo extra de "desidentificação" no logout.
    io.client.on('identify', (_event, payload: unknown) => {
      const token =
        typeof payload === 'object' && payload !== null && 'token' in payload
          ? (payload as { token?: unknown }).token
          : undefined
      const session = typeof token === 'string' ? getSessionByToken(token) : null
      setToken(session ? session.token : null)
    })

    // `toSocketIo` agenda o handshake inicial (pacotes "open"/"connect") via
    // microtask; emitir no mesmo tick entrega o evento fora de ordem e o
    // cliente o descarta. Agendar depois garante a ordem correta.
    queueMicrotask(() => {
      io.client.emit('system.ready', { at: new Date().toISOString() })
    })
  }),
]
