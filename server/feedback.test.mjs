import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import { createFeedbackHandler } from './feedback.mjs'

const note = {
  kind: 'channel',
  programme: 'Malgudi Days',
  language: 'Kannada',
  place: 'Bengaluru',
  message: 'Please put the old episodes on the dial.',
  email: 'viewer@example.com',
}

async function listen(handler) {
  const server = createServer((req, res) => void handler(req, res))
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

function post(origin, body, headers = {}) {
  return fetch(`${origin}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

test('files a channel request as a GitHub issue without storing the IP', async (t) => {
  const calls = []
  const handler = createFeedbackHandler({
    env: { GITHUB_FEEDBACK_TOKEN: 'test-token', GITHUB_FEEDBACK_REPO: 'tusharv/mailbox' },
    fetch: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) })
      return new Response(
        JSON.stringify({
          number: 4,
          html_url: 'https://github.com/tusharv/mailbox/issues/4',
        }),
        { status: 201 },
      )
    },
    now: () => 1_700_000_000_000,
  })
  const server = await listen(handler)
  t.after(server.close)
  const response = await post(server.origin, note)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    url: 'https://github.com/tusharv/mailbox/issues/4',
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.github.com/repos/tusharv/mailbox/issues')
  assert.match(calls[0].body.title, /^Channel: Malgudi Days/)
  assert.match(calls[0].body.body, /viewer@example.com/)
  assert.doesNotMatch(calls[0].body.body, /127\.0\.0\.1/)
})

test('drops a trapped note and refuses a closed or failing mailbox', async (t) => {
  let githubStatus = 500
  const calls = []
  const handler = createFeedbackHandler({
    env: { GITHUB_FEEDBACK_TOKEN: 'test-token' },
    fetch: async () => {
      calls.push(githubStatus)
      return new Response('no', { status: githubStatus })
    },
    now: () => 1_700_000_000_000,
  })
  const server = await listen(handler)
  t.after(server.close)

  const trapped = await post(server.origin, { ...note, pp_leave_blank: 'filled' })
  assert.equal(trapped.status, 200)
  assert.equal(calls.length, 0)

  const closed = createFeedbackHandler({ env: {}, fetch: async () => calls.push('fetch') })
  const closedServer = await listen(closed)
  t.after(closedServer.close)
  const unavailable = await post(closedServer.origin, note)
  assert.equal(unavailable.status, 503)
  assert.equal(calls.length, 0)

  const failed = await post(server.origin, note)
  assert.equal(failed.status, 502)
  githubStatus = 201
  const retried = await post(server.origin, note)
  assert.equal(retried.status, 200)
  assert.deepEqual(calls, [500, 201])
})

test('limits repeated notes and rejects a note that is not JSON', async (t) => {
  const handler = createFeedbackHandler({
    env: { GITHUB_FEEDBACK_TOKEN: 'test-token' },
    fetch: async () => new Response('{}', { status: 201 }),
    now: () => 1_700_000_000_000,
  })
  const server = await listen(handler)
  t.after(server.close)
  for (let count = 0; count < 5; count += 1) {
    const response = await post(server.origin, { ...note, message: `Please add episode ${count}.` })
    assert.equal(response.status, 200)
  }
  const limited = await post(server.origin, note)
  assert.equal(limited.status, 429)
  const plain = await fetch(server.origin, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'hello',
  })
  assert.equal(plain.status, 415)
  const huge = await post(server.origin, { ...note, message: 'x'.repeat(13_000) })
  assert.equal(huge.status, 413)
})
