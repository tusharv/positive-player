import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { isIP } from 'node:net'
import sirv from 'sirv'
import { WebSocketServer } from 'ws'
import { createSessionHub } from './sessionHub.mjs'

export function createRemoteServer(options = {}) {
  const hub = createSessionHub(options)
  const serve = sirv(fileURLToPath(new URL('../dist', import.meta.url)), { single: true })
  const server = createServer((req, res) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    serve(req, res, () => {
      res.statusCode = 404
      res.end('Build the app first with npm run build.')
    })
  })
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096, perMessageDeflate: false })
  const upgrades = new Map()
  server.on('upgrade', (req, socket, head) => {
    let valid = false
    try {
      const origin = new URL(req.headers.origin)
      valid = options.publicOrigin
        ? origin.origin === options.publicOrigin
        : ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host
    } catch {
      /* Missing or malformed origins are rejected. */
    }
    if (!valid || req.url !== '/remote-ws') {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n')
      return
    }
    const forwarded = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .at(-1)
      ?.trim()
    const address =
      options.trustProxy && forwarded && isIP(forwarded)
        ? forwarded
        : (req.socket.remoteAddress ?? 'unknown')
    const now = Date.now()
    const previous = upgrades.get(address)
    const limit = previous && now - previous.start < 60000 ? previous : { start: now, count: 0 }
    upgrades.set(address, limit)
    if (++limit.count > 60 || wss.clients.size >= 2000 || upgrades.size > 10000) {
      socket.end('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n')
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.alive = true
      ws.on('pong', () => {
        ws.alive = true
      })
      hub.attach(ws, address)
    })
  })
  const timer = setInterval(() => {
    hub.sweep()
    for (const [address, limit] of upgrades)
      if (Date.now() - limit.start >= 60000) upgrades.delete(address)
    for (const ws of wss.clients) {
      if (!ws.alive) {
        ws.terminate()
        continue
      }
      ws.alive = false
      ws.ping()
    }
  }, 15000)
  timer.unref()
  return {
    server,
    hub,
    async close() {
      clearInterval(timer)
      for (const ws of wss.clients) ws.terminate()
      wss.close()
      await new Promise((resolveClose) => server.close(resolveClose))
    },
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createRemoteServer({
    publicOrigin: process.env.PUBLIC_ORIGIN,
    trustProxy: process.env.TRUST_PROXY === '1',
  })
  const port = Number(process.env.PORT || 8787)
  app.server.listen(port, '0.0.0.0', () =>
    console.log(`Positive Player server listening on port ${port}`),
  )
  const shutdown = () => {
    void app.close().then(() => process.exit(0))
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
