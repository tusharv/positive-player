import { randomBytes, randomInt } from 'node:crypto'
import { isCommand, isSnapshot } from '../src/lib/remoteProtocol.ts'

const token = () => randomBytes(24).toString('base64url')
const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newCode = () =>
  Array.from({ length: 8 }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join('')
const text = (value) => (typeof value === 'string' ? value : '')
const send = (socket, message) => {
  if (socket?.readyState === 1 && socket.bufferedAmount < 65536)
    socket.send(JSON.stringify(message))
}
const error = (socket, code) => send(socket, { type: 'error', code })

export function createSessionHub({ now = Date.now, maxSessions = 1000 } = {}) {
  const sessions = new Map()
  const bindings = new Map()
  const attempts = new Map()

  function presence(session) {
    const message = {
      type: 'presence',
      hostOnline: Boolean(session.host && session.state),
      remoteOnline: Boolean(session.remote),
      paired: Boolean(session.remoteToken),
    }
    send(session.host, message)
    send(session.remote, message)
  }
  function info(session, role) {
    return {
      type: 'session',
      role,
      id: session.id,
      token: session[`${role}Token`],
      ...(role === 'host'
        ? { invite: session.invite, code: session.code, expiresAt: session.expiresAt }
        : {}),
    }
  }
  function end(session) {
    sessions.delete(session.id)
    for (const socket of [session.host, session.remote]) {
      if (socket) {
        bindings.delete(socket)
        send(socket, { type: 'ended' })
      }
    }
  }
  function sweep() {
    for (const session of sessions.values()) {
      if (
        now() - session.createdAt >= 12 * 60 * 60 * 1000 ||
        (session.hostGoneAt !== null && now() - session.hostGoneAt >= 120000)
      )
        end(session)
    }
    for (const [address, limit] of attempts)
      if (now() - limit.start >= 60000) attempts.delete(address)
  }
  function allowAttempt(address) {
    let limit = attempts.get(address)
    if (!limit || now() - limit.start >= 60000) {
      if (attempts.size >= 10000) return false
      limit = { count: 0, start: now() }
      attempts.set(address, limit)
    }
    return ++limit.count <= 20
  }
  function attach(socket, address = 'unknown') {
    const authenticationTimer = setTimeout(() => {
      if (!bindings.has(socket)) socket.close(1008, 'Pairing timed out')
    }, 10000)
    authenticationTimer.unref()
    let count = 0
    let since = now()
    socket.on('message', (raw, binary) => {
      if (now() - since >= 1000) {
        count = 0
        since = now()
      }
      if (++count > 30) {
        socket.close(1008, 'Too many messages')
        return
      }
      let msg
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        error(socket, 'invalid-message')
        return
      }
      if (binary || !msg || typeof msg !== 'object') {
        error(socket, 'invalid-message')
        return
      }
      sweep()
      const binding = bindings.get(socket)
      if (['create', 'join', 'resume'].includes(msg.type)) {
        if (binding) {
          error(socket, 'already-paired')
          return
        }
        if (!allowAttempt(address)) {
          error(socket, 'rate-limited')
          return
        }
        if (msg.type === 'create') {
          if (sessions.size >= maxSessions) {
            error(socket, 'server-busy')
            return
          }
          let code = newCode()
          while ([...sessions.values()].some((item) => item.code === code)) code = newCode()
          const session = {
            id: token(),
            hostToken: token(),
            remoteToken: null,
            invite: token(),
            code,
            expiresAt: now() + 300000,
            createdAt: now(),
            hostGoneAt: null,
            host: socket,
            remote: null,
            state: null,
          }
          sessions.set(session.id, session)
          bindings.set(socket, { session, role: 'host' })
          send(socket, info(session, 'host'))
          presence(session)
          return
        }
        if (msg.type === 'join') {
          const invite = text(msg.invite)
          const code = text(msg.code).toUpperCase().replace(/[\s-]/g, '')
          const session = [...sessions.values()].find(
            (item) =>
              !item.remoteToken &&
              item.expiresAt > now() &&
              ((invite && invite === item.invite) || (code && code === item.code)),
          )
          if (!session) {
            error(socket, 'invalid-pairing')
            return
          }
          session.remoteToken = token()
          session.invite = null
          session.code = null
          session.remote = socket
          bindings.set(socket, { session, role: 'remote' })
          send(socket, info(session, 'remote'))
          presence(session)
          if (session.state) send(socket, { type: 'state', state: session.state })
          return
        }
        const session = sessions.get(text(msg.id))
        const role = msg.role
        if (
          !session ||
          !['host', 'remote'].includes(role) ||
          !msg.token ||
          session[`${role}Token`] !== msg.token
        ) {
          error(socket, 'session-ended')
          return
        }
        // Only one live socket per role. A resumed credential replaces its old transport.
        const previous = session[role]
        if (previous) {
          bindings.delete(previous)
          previous.close(4001, 'Connection replaced')
        }
        session[role] = socket
        if (role === 'host') {
          session.hostGoneAt = null
          session.state = null
        }
        bindings.set(socket, { session, role })
        send(socket, info(session, role))
        presence(session)
        if (role === 'remote' && session.state)
          send(socket, { type: 'state', state: session.state })
        return
      }
      if (!binding) {
        error(socket, 'not-paired')
        return
      }
      const { session, role } = binding
      if (msg.type === 'end') {
        end(session)
        return
      }
      if (msg.type === 'state' && role === 'host' && isSnapshot(msg.state)) {
        // Pick only the public playback fields; never relay arbitrary host data.
        const { poweredOn, channelNumber, volume, muted, interruption } = msg.state
        session.state = { poweredOn, channelNumber, volume, muted, interruption }
        send(session.remote, { type: 'state', state: session.state })
        presence(session)
        return
      }
      if (msg.type === 'command' && role === 'remote' && isCommand(msg.command)) {
        if (!session.host || !session.state) {
          error(socket, 'tv-offline')
          return
        }
        if (!session.state.poweredOn) {
          error(socket, 'tv-off')
          return
        }
        const { action, value } = msg.command
        send(session.host, {
          type: 'command',
          command: action === 'mute' ? { action } : { action, value },
        })
        return
      }
      error(socket, 'invalid-message')
    })
    socket.on('close', () => {
      clearTimeout(authenticationTimer)
      const binding = bindings.get(socket)
      if (!binding) return
      bindings.delete(socket)
      const { session, role } = binding
      session[role] = null
      if (role === 'host') {
        session.hostGoneAt = now()
        session.state = null
      }
      presence(session)
    })
    socket.on('error', () => {})
  }
  return { attach, sweep }
}
