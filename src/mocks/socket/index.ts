import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

const realtime = ws.link('wss://realtime.kurio.local/*')

export const socketHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    // `toSocketIo` agenda o handshake inicial (pacotes "open"/"connect") via
    // microtask; emitir no mesmo tick entrega o evento fora de ordem e o
    // cliente o descarta. Agendar depois garante a ordem correta.
    queueMicrotask(() => {
      io.client.emit('system.ready', { at: new Date().toISOString() })
    })
  }),
]
