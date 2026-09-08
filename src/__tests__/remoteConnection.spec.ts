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
  constructor() {
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
})

describe('remote connection', () => {
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
