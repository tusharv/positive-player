import { isIP } from 'node:net'
import { fileURLToPath } from 'node:url'
import { feedbackIssue, githubIssueUrl, parseFeedback } from '../src/lib/feedback.ts'

export function loadFeedbackEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(fileURLToPath(new URL(`../${name}`, import.meta.url)))
    } catch {
      /* A missing local file is normal. The host environment still applies. */
    }
  }
}

const WINDOW_MS = 60 * 60 * 1000
const MAX_NOTES = 5
export const MAX_FEEDBACK_BYTES = 12_000

function textHeader(headers, name) {
  const value = headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

export function feedbackClientAddress(headers, { trustProxy = false, socketAddress = 'unknown' } = {}) {
  const vercelIp = textHeader(headers, 'x-vercel-forwarded-for')?.split(',')[0]?.trim()
  if (vercelIp && isIP(vercelIp)) return vercelIp
  if (trustProxy) {
    const forwarded = textHeader(headers, 'x-forwarded-for')?.split(',').at(-1)?.trim()
    if (forwarded && isIP(forwarded)) return forwarded
  }
  return socketAddress || 'unknown'
}

function prune(limits) {
  if (limits.size <= 5000) return
  let extra = limits.size - 4000
  for (const key of limits.keys()) {
    limits.delete(key)
    if (--extra <= 0) break
  }
}

function recentHits(limits, address, now) {
  const hits = (limits.get(address) ?? []).filter((time) => now - time < WINDOW_MS)
  limits.set(address, hits)
  prune(limits)
  return hits
}

function mailbox(env) {
  const token = env.GITHUB_FEEDBACK_TOKEN?.trim()
  const repo = (env.GITHUB_FEEDBACK_REPO?.trim() || 'tusharv/positive-player').replace(
    /^\/+|\/+$/g,
    '',
  )
  if (!token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return null
  return { token, repo }
}

export async function receiveFeedback({
  method,
  contentType = '',
  rawBody = Buffer.alloc(0),
  address = 'unknown',
  userAgent = '',
  env = process.env,
  fetchImpl = globalThis.fetch,
  limits,
  now = Date.now,
}) {
  if (method !== 'POST') {
    return { status: 405, payload: { error: 'Send the note with POST.' }, headers: { Allow: 'POST' } }
  }
  if (!String(contentType).toLowerCase().startsWith('application/json')) {
    return { status: 415, payload: { error: 'Send the note as JSON.' } }
  }
  if (rawBody.length > MAX_FEEDBACK_BYTES) {
    return { status: 413, payload: { error: 'That note is too long.' } }
  }

  let input
  try {
    input = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : {}
  } catch {
    return { status: 400, payload: { error: 'That note could not be read.' } }
  }

  const parsed = parseFeedback(input)
  if (!parsed.ok) return { status: 400, payload: { error: parsed.error, fields: parsed.fields } }

  const hits = recentHits(limits, address, now())
  if (hits.length >= MAX_NOTES) {
    return {
      status: 429,
      payload: { error: 'The station has enough notes from you for now. Try again later.' },
      headers: { 'Retry-After': '3600' },
    }
  }

  if (parsed.spam) {
    hits.push(now())
    return { status: 200, payload: { ok: true } }
  }

  const box = mailbox(env)
  if (!box) {
    return {
      status: 503,
      payload: { error: 'The mailbox is not open yet. You can still leave a note on GitHub.' },
    }
  }

  const issue = feedbackIssue(parsed.note, { userAgent })
  let response
  try {
    response = await fetchImpl(`https://api.github.com/repos/${box.repo}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${box.token}`,
        'Content-Type': 'application/json',
        'User-Agent': '1988-in-station-mail',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(issue),
    })
  } catch {
    console.error('feedback: could not reach GitHub')
    return {
      status: 502,
      payload: { error: 'The station could not file that note. Try again in a moment.' },
    }
  }
  if (!response.ok) {
    console.error(`feedback: GitHub responded ${response.status}`)
    return {
      status: 502,
      payload: { error: 'The station could not file that note. Try again in a moment.' },
    }
  }

  let url
  try {
    url = githubIssueUrl((await response.json())?.html_url)
  } catch {
    /* The note was filed even when GitHub omits the issue link. */
  }
  hits.push(now())
  return { status: 200, payload: url ? { ok: true, url } : { ok: true } }
}

function send(res, result) {
  res.statusCode = result.status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [key, value] of Object.entries(result.headers ?? {})) res.setHeader(key, value)
  res.end(JSON.stringify(result.payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    const fail = (error) => {
      if (settled) return
      settled = true
      reject(error)
    }
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_FEEDBACK_BYTES) {
        fail(Object.assign(new Error('too-large'), { status: 413 }))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      resolve(Buffer.concat(chunks))
    })
    req.on('error', fail)
  })
}

export function createFeedbackHandler(options = {}) {
  const limits = options.limits ?? new Map()
  const fetchImpl = options.fetch ?? globalThis.fetch
  const env = options.env ?? process.env
  const now = options.now ?? Date.now
  const trustProxy = options.trustProxy ?? env.TRUST_PROXY === '1'

  return async function handleFeedback(req, res) {
    const contentType = textHeader(req.headers, 'content-type') ?? ''
    const advertised = Number(textHeader(req.headers, 'content-length') || 0)
    if (Number.isFinite(advertised) && advertised > MAX_FEEDBACK_BYTES) {
      send(res, { status: 413, payload: { error: 'That note is too long.' } })
      req.resume?.()
      return
    }
    let rawBody = Buffer.alloc(0)
    if (req.method === 'POST' && contentType.toLowerCase().startsWith('application/json')) {
      try {
        rawBody = await readBody(req)
      } catch (error) {
        send(res, {
          status: error.status === 413 ? 413 : 400,
          payload: {
            error: error.status === 413 ? 'That note is too long.' : 'That note could not be read.',
          },
        })
        return
      }
    } else {
      req.resume?.()
    }

    const result = await receiveFeedback({
      method: req.method,
      contentType,
      rawBody,
      address: feedbackClientAddress(req.headers, {
        trustProxy,
        socketAddress: req.socket?.remoteAddress,
      }),
      userAgent: textHeader(req.headers, 'user-agent') ?? '',
      env,
      fetchImpl,
      limits,
      now,
    })
    send(res, result)
  }
}
