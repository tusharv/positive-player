import {
  createFeedbackHandler,
  feedbackClientAddress,
  loadFeedbackEnv,
  MAX_FEEDBACK_BYTES,
  receiveFeedback,
} from '../server/feedback.mjs'

loadFeedbackEnv()
const limits = new Map()
const handleFeedback = createFeedbackHandler({ trustProxy: true, limits })

function json(status, payload, extra = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  })
}

async function fromWeb(request) {
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { error: 'Send the note as JSON.' })
  }
  const length = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(length) && length > MAX_FEEDBACK_BYTES) {
    return json(413, { error: 'That note is too long.' })
  }
  const rawBody = Buffer.from(await request.arrayBuffer())
  const headers = {}
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })
  const result = await receiveFeedback({
    method: 'POST',
    contentType,
    rawBody,
    address: feedbackClientAddress(headers, { trustProxy: true }),
    userAgent: request.headers.get('user-agent') ?? '',
    limits,
  })
  return json(result.status, result.payload, result.headers)
}

export function POST(request, response) {
  if (response?.setHeader) return handleFeedback(request, response)
  return fromWeb(request)
}
