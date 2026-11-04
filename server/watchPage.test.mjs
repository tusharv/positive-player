import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:http'
import test from 'node:test'
import { serveWatchPage } from './watchPage.mjs'

test('watch handler serves selected channel HTML and safely falls back for invalid links', async (t) => {
  const root = await mkdtemp(join(tmpdir(), '1988-share-'))
  await mkdir(join(root, 'share-pages'))
  await writeFile(join(root, 'share-pages', '1.html'), '<title>Bollywood</title>')
  await writeFile(join(root, 'share-pages', 'fallback.html'), '<title>1988.in</title>')
  const server = createServer(
    (req, res) => void serveWatchPage(req, res, pathToFileURL(`${root}/`)),
  )
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(root, { recursive: true, force: true })
  })
  const origin = `http://127.0.0.1:${server.address().port}`
  const channel = await fetch(`${origin}/watch?channel=1&unrelated=true`)
  assert.equal(channel.status, 200)
  assert.match(channel.headers.get('content-type'), /text\/html/)
  assert.equal(await channel.text(), '<title>Bollywood</title>')
  for (const value of [
    '',
    '?channel=9999',
    '?channel=-1',
    '?channel=NaN',
    '?channel=1.5',
    '?channel=..%2Findex',
    '?channel=1&channel=2',
  ]) {
    const response = await fetch(`${origin}/watch${value}`)
    assert.equal(response.status, 200)
    assert.equal(await response.text(), '<title>1988.in</title>')
  }
  const padded = await fetch(`${origin}/watch?channel=001`)
  assert.equal(await padded.text(), '<title>Bollywood</title>')
  const head = await fetch(`${origin}/watch?channel=1`, { method: 'HEAD' })
  assert.equal(await head.text(), '')
  assert.equal(head.status, 200)
  const post = await fetch(`${origin}/watch`, { method: 'POST' })
  assert.equal(post.status, 405)
})
