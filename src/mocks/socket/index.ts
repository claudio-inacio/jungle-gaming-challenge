import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

const realtime = ws.link('wss://realtime.kurio.local')

export const socketHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    io.client.emit('system.ready', { at: new Date().toISOString() })
  }),
]
