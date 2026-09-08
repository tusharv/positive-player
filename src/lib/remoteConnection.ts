export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting'
export type Credentials = { role: 'host' | 'remote'; id: string; token: string }
export type JoinMessage = { type: 'join'; code?: string; invite?: string }
export type ServerMessage = Record<string, unknown> & { type: string }

export const remoteErrors: Record<string, string> = {
  'invalid-pairing': 'That code has expired or is already in use. Ask the TV for a new code.',
  'session-ended': 'This connection has ended. Pair with the TV again.',
  'rate-limited': 'Too many pairing attempts. Wait a minute and try again.',
  'server-busy': 'The remote service is busy. Please try again shortly.',
  'tv-offline': 'The TV is reconnecting. Try again when it is back.',
  'tv-off': 'Turn on the TV on your desktop first.',
  replaced: 'This remote was opened in another tab.',
}

export class RemoteConnection {
  private socket: WebSocket | null = null
  private retry = 0
  private handshakeTimer = 0
  private attempt = 0
  private active = false
  private authenticated = false
  private credentials: Credentials | null = null
  private join: JoinMessage | undefined
  private offline = () => {
    if (!this.active) return
    window.clearTimeout(this.retry)
    window.clearTimeout(this.handshakeTimer)
    this.authenticated = false
    const socket = this.socket
    this.socket = null
    socket?.close()
    this.callbacks.status('reconnecting')
  }
  private online = () => {
    if (this.active && !this.socket) {
      window.clearTimeout(this.retry)
      this.connect()
    }
  }
  private role: Credentials['role']
  private callbacks: {
    message: (message: ServerMessage) => void
    status: (status: ConnectionStatus) => void
  }

  constructor(role: Credentials['role'], callbacks: RemoteConnection['callbacks']) {
    this.role = role
    this.callbacks = callbacks
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.key) ?? 'null')
      if (saved?.role === role && typeof saved.id === 'string' && typeof saved.token === 'string')
        this.credentials = saved
    } catch {
      /* Pairing works in memory when session storage is unavailable. */
    }
  }
  private get key() {
    return `pp-remote-${this.role}`
  }
  get canResume() {
    return Boolean(this.credentials)
  }
  start(join?: JoinMessage) {
    this.destroy()
    this.join = join
    if (join) this.forget()
    if (this.role === 'remote' && !join && !this.credentials) return
    this.active = true
    window.addEventListener('offline', this.offline)
    window.addEventListener('online', this.online)
    this.attempt = 0
    this.connect()
  }
  private connect() {
    if (!this.active) return
    this.callbacks.status(this.attempt ? 'reconnecting' : 'connecting')
    if (!navigator.onLine) {
      this.callbacks.status('reconnecting')
      return
    }
    const url = new URL('/remote-ws', window.location.href)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(url)
    this.socket = socket
    this.handshakeTimer = window.setTimeout(() => socket.close(), 10000)
    socket.onopen = () => {
      if (this.socket !== socket) return
      socket.send(
        JSON.stringify(
          this.credentials
            ? { type: 'resume', ...this.credentials }
            : (this.join ?? { type: 'create' }),
        ),
      )
    }
    socket.onmessage = (event) => {
      if (this.socket !== socket || !this.active) return
      let message: ServerMessage
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (!message || typeof message.type !== 'string') return
      if (
        message.type === 'session' &&
        message.role === this.role &&
        typeof message.id === 'string' &&
        typeof message.token === 'string'
      ) {
        this.credentials = { role: this.role, id: message.id, token: message.token }
        try {
          sessionStorage.setItem(this.key, JSON.stringify(this.credentials))
        } catch {
          /* Memory fallback. */
        }
        this.authenticated = true
        this.attempt = 0
        window.clearTimeout(this.handshakeTimer)
        this.callbacks.status('connected')
      }
      if (
        message.type === 'ended' ||
        (message.type === 'error' &&
          [
            'invalid-pairing',
            'session-ended',
            'rate-limited',
            'server-busy',
            'not-paired',
          ].includes(String(message.code)))
      ) {
        this.forget()
        this.destroy()
      }
      this.callbacks.message(message)
    }
    socket.onerror = () => {
      /* The close event schedules reconnection. */
    }
    socket.onclose = (event) => {
      if (this.socket !== socket) return
      window.clearTimeout(this.handshakeTimer)
      this.authenticated = false
      this.socket = null
      if (!this.active) return
      if (event.code === 4001 || event.code === 1008) {
        this.forget()
        this.destroy()
        this.callbacks.message({
          type: 'error',
          code: event.code === 4001 ? 'replaced' : 'rate-limited',
        })
        return
      }
      this.callbacks.status('reconnecting')
      const delay = Math.min(1000 * 2 ** this.attempt++, 10000)
      this.retry = window.setTimeout(() => this.connect(), delay)
    }
  }
  send(message: object): boolean {
    // No queue: a press made offline must never change playback later.
    if (!this.authenticated || this.socket?.readyState !== 1 || this.socket.bufferedAmount > 4096)
      return false
    this.socket.send(JSON.stringify(message))
    return true
  }
  end() {
    this.send({ type: 'end' })
    this.forget()
    this.destroy()
  }
  private forget() {
    this.credentials = null
    try {
      sessionStorage.removeItem(this.key)
    } catch {
      /* Memory fallback. */
    }
  }
  destroy() {
    this.active = false
    window.removeEventListener('offline', this.offline)
    window.removeEventListener('online', this.online)
    this.authenticated = false
    window.clearTimeout(this.retry)
    window.clearTimeout(this.handshakeTimer)
    const socket = this.socket
    this.socket = null
    socket?.close()
    this.callbacks.status('idle')
  }
}
