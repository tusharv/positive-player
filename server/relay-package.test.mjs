import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, copyFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { WebSocket } from 'ws'

test('relay-only package starts without a built website and accepts pairing', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'positive-player-relay-'))
  let app
  t.after(async () => {
    if (app) await app.close()
    await rm(root, { recursive: true, force: true })
  })
  for (const file of [
    'server/index.mjs',
    'server/sessionHub.mjs',
    'src/lib/remoteProtocol.ts',
    'src/data/channels.ts',
  ]) {
    const destination = join(root, file)
    await mkdir(join(destination, '..'), { recursive: true })
    await copyFile(new URL('../' + file, import.meta.url), destination)
  }
  await symlink(
    fileURLToPath(new URL('../node_modules', import.meta.url)),
    join(root, 'node_modules'),
  )
  const { createRemoteServer } = await import(pathToFileURL(join(root, 'server/index.mjs')))
  app = createRemoteServer({ publicOrigin: 'https://1988-in.vercel.app' })
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${app.server.address().port}`
  assert.deepEqual(await (await fetch(origin + '/healthz')).json(), { status: 'ok' })
  assert.equal((await fetch(origin + '/')).status, 404)
  const socket = new WebSocket(origin.replace('http:', 'ws:') + '/remote-ws', {
    origin: 'https://1988-in.vercel.app',
  })
  await new Promise((resolve, reject) => {
    socket.on('error', reject)
    socket.on('open', () => socket.send(JSON.stringify({ type: 'create' })))
    socket.on('message', (raw) => {
      const message = JSON.parse(raw)
      if (message.type !== 'session') return
      assert.equal(message.role, 'host')
      socket.close()
      resolve()
    })
  })
})
