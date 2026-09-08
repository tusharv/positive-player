import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { createSessionHub } from '../server/sessionHub.mjs'

const hub = createSessionHub()
const server = createServer((_request, response) => {
  response.statusCode = 426
  response.setHeader('Content-Type', 'text/plain')
  response.end('Expected a WebSocket connection')
})
const wss = new WebSocketServer({
  server,
  maxPayload: 4096,
  perMessageDeflate: false,
  verifyClient(info) {
    try {
      const origin = new URL(info.origin)
      return ['http:', 'https:'].includes(origin.protocol) && origin.host === info.req.headers.host
    } catch {
      return false
    }
  },
})

wss.on('connection', (socket, request) => {
  const forwarded = String(request.headers['x-forwarded-for'] ?? '')
    .split(',')
    .at(-1)
    ?.trim()
  socket.alive = true
  socket.on('pong', () => {
    socket.alive = true
  })
  hub.attach(socket, forwarded || request.socket.remoteAddress || 'unknown')
})

const timer = setInterval(() => {
  hub.sweep()
  for (const socket of wss.clients) {
    if (!socket.alive) {
      socket.terminate()
      continue
    }
    socket.alive = false
    socket.ping()
  }
}, 15000)
timer.unref()

export const config = { maxDuration: 300 }
export default server
