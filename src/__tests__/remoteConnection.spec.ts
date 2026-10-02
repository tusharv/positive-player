import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RemoteConnection } from '../lib/remoteConnection'
import { isCommand, isSnapshot } from '../lib/remoteProtocol'

class Socket {
  static instances: Socket[] = []
  readyState = 0
  bufferedAmount = 0
  sent: Array<Record<string, unknown>> = []
  onopen: (() => void) | null = null
  onclose: ((event: { code: number }) => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  constructor(public url: string | URL) {
    Socket.instances.push(this)
  }
  send(data: string) {
    this.sent.push(JSON.parse(data))
  }
  open() {
    this.readyState = 1
    this.onopen?.()
  }
  close() {
    this.readyState = 3
    this.onclose?.({ code: 1006 })
  }
  message(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  Socket.instances = []
  sessionStorage.clear()
  vi.stubGlobal('WebSocket', Socket)
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('remote connection', () => {
  it('uses the configured persistent relay for both devices', () => {
    vi.stubEnv('VITE_REMOTE_WS_URL', 'wss://remote.example.com/remote-ws')
    const host = new RemoteConnection('host', { message: vi.fn(), status: vi.fn() })
    const phone = new RemoteConnection('remote', { message: vi.fn(), status: vi.fn() })
    host.start()
    phone.start({ type: 'join', code: 'ABCDEFGH' })
    expect(Socket.instances.map((socket) => String(socket.url))).toEqual([
      'wss://remote.example.com/remote-ws',
      'wss://remote.example.com/remote-ws',
    ])
    host.destroy()
    phone.destroy()
  })
  it('rejects an insecure relay on an HTTPS website without throwing', () => {
    vi.stubEnv('VITE_REMOTE_WS_URL', 'ws://remote.example.com/remote-ws')
    vi.stubGlobal('location', new URL('https://tv.example.com'))
    const message = vi.fn()
    const connection = new RemoteConnection('host', { message, status: vi.fn() })
    connection.start()
    expect(Socket.instances).toHaveLength(0)
    expect(message).toHaveBeenCalledWith({ type: 'error', code: 'service-unavailable' })
    connection.destroy()
  })
  it('resumes credentials and never queues offline commands', () => {
    const connection = new RemoteConnection('remote', { message: vi.fn(), status: vi.fn() })
    connection.start({ type: 'join', code: 'ABCDEFGH' })
    const first = Socket.instances[0]!
    first.open()
    expect(first.sent).toEqual([{ type: 'join', code: 'ABCDEFGH' }])
    first.message({ type: 'session', role: 'remote', id: 'id', token: 'secret' })
    first.close()
    expect(connection.send({ type: 'command', command: { action: 'mute' } })).toBe(false)
    vi.advanceTimersByTime(2000)
    const second = Socket.instances[1]!
    second.open()
    expect(second.sent).toEqual([{ type: 'resume', role: 'remote', id: 'id', token: 'secret' }])
    connection.destroy()
  })
  it('drops the transport immediately when the browser goes offline', () => {
    const connection = new RemoteConnection('remote', { message: vi.fn(), status: vi.fn() })
    connection.start({ type: 'join', code: 'ABCDEFGH' })
    const socket = Socket.instances[0]!
    socket.open()
    socket.message({ type: 'session', role: 'remote', id: 'id', token: 'secret' })
    window.dispatchEvent(new Event('offline'))
    expect(connection.send({ type: 'command', command: { action: 'mute' } })).toBe(false)
    expect(socket.readyState).toBe(3)
    window.dispatchEvent(new Event('online'))
    const returning = Socket.instances[1]!
    returning.open()
    expect(returning.sent).toEqual([{ type: 'resume', role: 'remote', id: 'id', token: 'secret' }])
    connection.destroy()
  })
  it('clears expired credentials and stops reconnecting', () => {
    sessionStorage.setItem(
      'pp-remote-remote',
      JSON.stringify({ id: 'id', token: 'secret', role: 'remote' }),
    )
    const connection = new RemoteConnection('remote', { message: vi.fn(), status: vi.fn() })
    connection.start()
    const socket = Socket.instances[0]!
    socket.open()
    socket.message({ type: 'error', code: 'session-ended' })
    vi.advanceTimersByTime(30000)
    expect(Socket.instances).toHaveLength(1)
    expect(sessionStorage.getItem('pp-remote-remote')).toBeNull()
  })
  it.each(['rate-limited', 'server-busy'])(
    'retries %s without losing pairing credentials',
    (code) => {
      const credentials = { role: 'remote', id: 'id', token: 'secret' }
      sessionStorage.setItem('pp-remote-remote', JSON.stringify(credentials))
      const status = vi.fn()
      const connection = new RemoteConnection('remote', { message: vi.fn(), status })
      connection.start()
      const first = Socket.instances[0]!
      first.open()
      first.message({ type: 'error', code, retryAfterMs: 60000 })
      expect(connection.canResume).toBe(true)
      expect(JSON.parse(sessionStorage.getItem('pp-remote-remote')!)).toEqual(credentials)
      expect(status).toHaveBeenLastCalledWith('reconnecting')
      expect(connection.send({ type: 'command', command: { action: 'mute' } })).toBe(false)
      vi.advanceTimersByTime(59000)
      expect(Socket.instances).toHaveLength(1)
      vi.advanceTimersByTime(6000)
      const returning = Socket.instances[1]!
      returning.open()
      expect(returning.sent).toEqual([{ type: 'resume', ...credentials }])
      returning.message({ type: 'session', ...credentials })
      expect(status).toHaveBeenLastCalledWith('connected')
      expect(returning.sent).toHaveLength(1)
      connection.destroy()
    },
  )
  it('cancels a rate-limit retry when disconnected explicitly', () => {
    const connection = new RemoteConnection('host', { message: vi.fn(), status: vi.fn() })
    connection.start()
    Socket.instances[0]!.open()
    Socket.instances[0]!.message({ type: 'error', code: 'rate-limited' })
    connection.end()
    vi.advanceTimersByTime(120000)
    expect(Socket.instances).toHaveLength(1)
  })
  it('keeps resuming through a minute of rejected WebSocket upgrades', () => {
    const credentials = { role: 'remote', id: 'id', token: 'secret' }
    sessionStorage.setItem('pp-remote-remote', JSON.stringify(credentials))
    const message = vi.fn()
    const connection = new RemoteConnection('remote', { message, status: vi.fn() })
    connection.start()
    for (let i = 0; i < 8; i++) {
      Socket.instances[Socket.instances.length - 1]!.close()
      vi.advanceTimersByTime(11000)
    }
    const returning = Socket.instances[Socket.instances.length - 1]!
    expect(returning.readyState).toBe(0)
    returning.open()
    expect(returning.sent).toEqual([{ type: 'resume', ...credentials }])
    returning.message({ type: 'session', ...credentials })
    expect(message).not.toHaveBeenCalledWith({ type: 'error', code: 'service-unavailable' })
    connection.destroy()
  })
  it('gives up when the remote service never answers', () => {
    const message = vi.fn()
    const connection = new RemoteConnection('host', { message, status: vi.fn() })
    connection.start()
    for (let i = 0; i < 4; i++) {
      Socket.instances[Socket.instances.length - 1]!.close()
      vi.advanceTimersByTime(20000)
    }
    expect(message).toHaveBeenCalledWith({ type: 'error', code: 'service-unavailable' })
    const attempts = Socket.instances.length
    vi.advanceTimersByTime(30000)
    expect(Socket.instances).toHaveLength(attempts)
    connection.destroy()
  })
})

it('accepts only supported commands and valid TV state', () => {
  expect(isCommand({ action: 'volumeStep', value: 5 })).toBe(true)
  expect(isCommand({ action: 'volumeStep', value: 500 })).toBe(false)
  expect(isCommand({ action: 'digit', value: '12' })).toBe(false)
  expect(isCommand({ action: 'loadUrl', value: 'https://example.com' })).toBe(false)
  expect(
    isSnapshot({
      poweredOn: true,
      channelNumber: 1,
      volume: 80,
      muted: false,
      interruption: 'none',
    }),
  ).toBe(true)
  expect(
    isSnapshot({
      poweredOn: true,
      channelNumber: 99,
      volume: 80,
      muted: false,
      interruption: 'none',
    }),
  ).toBe(true)
  expect(
    isSnapshot({
      poweredOn: true,
      channelNumber: 999,
      volume: 80,
      muted: false,
      interruption: 'none',
    }),
  ).toBe(false)
})
