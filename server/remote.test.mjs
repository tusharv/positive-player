import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WebSocket } from 'ws'
import { createRemoteServer } from './index.mjs'

async function fixture(t, options = {}) {
  const app = createRemoteServer(options)
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${app.server.address().port}`
  t.after(() => app.close())
  async function client() {
    const ws = new WebSocket(origin.replace('http:', 'ws:') + '/remote-ws', { origin })
    const queue = []
    const listeners = []
    ws.on('message', (data) => {
      const msg = JSON.parse(data)
      const index = listeners.findIndex((item) => item.type === msg.type)
      if (index >= 0) listeners.splice(index, 1)[0].resolve(msg)
      else queue.push(msg)
    })
    await new Promise((resolve, reject) => {
      ws.once('open', resolve)
      ws.once('error', reject)
    })
    return {
      ws,
      send: (msg) => ws.send(JSON.stringify(msg)),
      next(type) {
        const index = queue.findIndex((msg) => msg.type === type)
        if (index >= 0) return Promise.resolve(queue.splice(index, 1)[0])
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${type}`)), 1500)
          listeners.push({
            type,
            resolve: (msg) => {
              clearTimeout(timer)
              resolve(msg)
            },
          })
        })
      },
    }
  }
  return { ...app, client, origin }
}
const state = { poweredOn: true, channelNumber: 3, volume: 65, muted: false, interruption: 'none' }
async function pair(app) {
  const host = await app.client()
  host.send({ type: 'create' })
  const session = await host.next('session')
  host.send({ type: 'state', state })
  const remote = await app.client()
  remote.send({ type: 'join', invite: session.invite })
  const credentials = await remote.next('session')
  await remote.next('state')
  return { host, remote, session, credentials }
}

test('pairs once, relays commands to the host and authoritative state to the phone', async (t) => {
  const app = await fixture(t)
  const { host, remote, session } = await pair(app)
  remote.send({ type: 'command', command: { action: 'channelStep', value: 1 } })
  assert.deepEqual((await host.next('command')).command, { action: 'channelStep', value: 1 })
  host.send({ type: 'state', state: { ...state, channelNumber: 4 } })
  assert.equal((await remote.next('state')).state.channelNumber, 4)
  const stranger = await app.client()
  stranger.send({ type: 'join', invite: session.invite })
  assert.equal((await stranger.next('error')).code, 'invalid-pairing')
  stranger.send({ type: 'resume', role: 'host', id: session.id, token: 'wrong' })
  assert.equal((await stranger.next('error')).code, 'session-ended')
})

test('supports short codes and rejects expired invitations', async (t) => {
  let now = 0
  const app = await fixture(t, { now: () => now })
  const host = await app.client()
  host.send({ type: 'create' })
  const session = await host.next('session')
  const remote = await app.client()
  now = 300001
  remote.send({ type: 'join', code: session.code })
  assert.equal((await remote.next('error')).code, 'invalid-pairing')
  host.send({ type: 'end' })
  await host.next('ended')
  host.send({ type: 'create' })
  const fresh = await host.next('session')
  remote.send({ type: 'join', code: fresh.code })
  assert.equal((await remote.next('session')).role, 'remote')
})

test('rejects unauthenticated commands, invalid values and remote state writes', async (t) => {
  const app = await fixture(t)
  const stranger = await app.client()
  stranger.send({ type: 'command', command: { action: 'mute' } })
  assert.equal((await stranger.next('error')).code, 'not-paired')
  const { remote } = await pair(app)
  remote.send({ type: 'command', command: { action: 'volumeStep', value: 1000 } })
  assert.equal((await remote.next('error')).code, 'invalid-message')
  remote.send({ type: 'state', state })
  assert.equal((await remote.next('error')).code, 'invalid-message')
})

test('reconnects without replaying offline commands and ends access from desktop', async (t) => {
  const app = await fixture(t)
  const { host, remote, session, credentials } = await pair(app)
  host.ws.close()
  let presence = await remote.next('presence')
  while (presence.hostOnline) presence = await remote.next('presence')
  remote.send({ type: 'command', command: { action: 'mute' } })
  assert.equal((await remote.next('error')).code, 'tv-offline')
  const returningHost = await app.client()
  returningHost.send({ type: 'resume', role: 'host', id: session.id, token: session.token })
  await returningHost.next('session')
  returningHost.send({ type: 'state', state })
  assert.deepEqual((await remote.next('state')).state, state)
  returningHost.send({ type: 'end' })
  await remote.next('ended')
  const returningRemote = await app.client()
  returningRemote.send({
    type: 'resume',
    role: 'remote',
    id: credentials.id,
    token: credentials.token,
  })
  assert.equal((await returningRemote.next('error')).code, 'session-ended')
})

test('expires sessions after host reconnect grace', async (t) => {
  let now = 0
  const app = await fixture(t, { now: () => now })
  const { host, remote, session } = await pair(app)
  host.ws.close()
  let presence = await remote.next('presence')
  while (presence.hostOnline) presence = await remote.next('presence')
  now = 120001
  app.hub.sweep()
  await remote.next('ended')
  const client = await app.client()
  client.send({ type: 'resume', role: 'host', id: session.id, token: session.token })
  assert.equal((await client.next('error')).code, 'session-ended')
})

test('rejects socket upgrades from another origin', async (t) => {
  const app = await fixture(t)
  const ws = new WebSocket(app.origin.replace('http:', 'ws:') + '/remote-ws', {
    origin: 'https://other.example',
  })
  await new Promise((resolve) => {
    ws.on('unexpected-response', (_, response) => {
      assert.equal(response.statusCode, 403)
      response.resume()
      ws.terminate()
      resolve()
    })
    ws.on('error', () => {})
  })
})

test('relays power off and keeps the paired remote informed of standby', async (t) => {
  const app = await fixture(t)
  const { host, remote } = await pair(app)
  remote.send({ type: 'command', command: { action: 'powerOff' } })
  assert.deepEqual((await host.next('command')).command, { action: 'powerOff' })
  host.send({ type: 'state', state: { ...state, poweredOn: false } })
  assert.equal((await remote.next('state')).state.poweredOn, false)
  host.send({ type: 'state', state })
  assert.equal((await remote.next('state')).state.poweredOn, true)
})

test('allows the power toggle in standby but blocks other controls', async (t) => {
  const app = await fixture(t)
  const { host, remote } = await pair(app)
  remote.send({ type: 'command', command: { action: 'powerToggle' } })
  assert.deepEqual((await host.next('command')).command, { action: 'powerToggle' })
  host.send({ type: 'state', state: { ...state, poweredOn: false } })
  await remote.next('state')
  remote.send({ type: 'command', command: { action: 'mute' } })
  assert.equal((await remote.next('error')).code, 'tv-off')
  remote.send({ type: 'command', command: { action: 'powerToggle' } })
  assert.deepEqual((await host.next('command')).command, { action: 'powerToggle' })
})
