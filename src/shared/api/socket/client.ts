import { io } from 'socket.io-client'
import { env } from '@/shared/config/env'

export const socket = io(env.socketUrl, { autoConnect: false, transports: ['websocket'] })
