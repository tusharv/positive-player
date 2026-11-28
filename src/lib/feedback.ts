export const ACCESS_BLOCKERS = [
  { id: 'playback', label: 'A video will not play' },
  { id: 'region', label: 'It is blocked where I am' },
  { id: 'loading', label: 'The page will not load' },
  { id: 'controls', label: 'Sound, channels, or the remote' },
  { id: 'other', label: 'Something else' },
] as const

export type FeedbackKind = 'access' | 'channel'
export type AccessBlocker = (typeof ACCESS_BLOCKERS)[number]['id']

export type FeedbackNote = {
  kind: FeedbackKind
  message: string
  blocker?: AccessBlocker
  channel?: string
  programme?: string
  language?: string
  link?: string
  place?: string
  name?: string
  email?: string
  locale?: string
  timezone?: string
  page?: string
}

export type FeedbackField = 'kind' | 'message' | 'programme' | 'link' | 'email' | 'blocker'

export type FeedbackProblem = { field: FeedbackField; message: string }

export type ParsedFeedback =
  | { ok: true; spam: true }
  | { ok: true; spam: false; note: FeedbackNote }
  | { ok: false; error: string; fields: FeedbackProblem[] }

const BLOCKER_IDS = new Set<string>(ACCESS_BLOCKERS.map((item) => item.id))

function line(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function messageText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 2000)
}

function optional(value: string): string | undefined {
  return value || undefined
}

function httpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function locale(value: unknown): string | undefined {
  const text = line(value, 35)
  return /^[A-Za-z]{2,3}([_-][A-Za-z0-9]{2,8}){0,3}$/.test(text) ? text : undefined
}

function timezone(value: unknown): string | undefined {
  const text = line(value, 64)
  return /^[A-Za-z0-9_+-]{1,32}(?:\/[A-Za-z0-9_+-]{1,32}){0,2}$/.test(text) ? text : undefined
}

function pagePath(value: unknown): string | undefined {
  const text = line(value, 80)
  return /^\/[A-Za-z0-9/_-]*$/.test(text) ? text : undefined
}

function reject(fields: FeedbackProblem[]): ParsedFeedback {
  return { ok: false, error: fields[0]?.message ?? 'That note could not be read.', fields }
}

export function githubIssueUrl(value: unknown): string | undefined {
  return typeof value === 'string' &&
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+$/.test(value)
    ? value
    : undefined
}

export function parseFeedback(input: unknown): ParsedFeedback {
  if (!input || typeof input !== 'object') {
    return reject([{ field: 'message', message: 'That note could not be read.' }])
  }
  const body = input as Record<string, unknown>
  if (line(body.pp_leave_blank, 200)) return { ok: true, spam: true }

  const kind = body.kind
  const problems: FeedbackProblem[] = []
  if (kind !== 'access' && kind !== 'channel') {
    problems.push({ field: 'kind', message: 'Choose feedback or a channel request.' })
  }

  const message = messageText(body.message)
  if (message.length < 12) {
    problems.push({ field: 'message', message: 'Tell us a bit more — a sentence is enough.' })
  }

  const link = line(body.link, 300)
  if (link && !httpUrl(link)) {
    problems.push({ field: 'link', message: 'The link should start with http:// or https://.' })
  }

  const email = line(body.email, 120)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    problems.push({ field: 'email', message: 'That email address does not look complete.' })
  }

  let programme = ''
  let blocker = ''
  if (kind === 'channel') {
    programme = line(body.programme, 120)
    if (programme.length < 2) {
      problems.push({ field: 'programme', message: 'Name the channel or programme you want.' })
    }
  } else if (kind === 'access') {
    blocker = line(body.blocker, 20)
    if (blocker && !BLOCKER_IDS.has(blocker)) {
      problems.push({
        field: 'blocker',
        message: 'Choose what got in the way, or leave that blank.',
      })
    }
  }

  if (kind !== 'access' && kind !== 'channel') return reject(problems)
  if (problems.length) return reject(problems)

  const note: FeedbackNote = {
    kind,
    message,
    link: optional(link),
    place: optional(line(body.place, 80)),
    name: optional(line(body.name, 80)),
    email: optional(email),
    locale: locale(body.locale),
    timezone: timezone(body.timezone),
    page: pagePath(body.page),
  }

  if (kind === 'access') {
    note.blocker = (blocker || undefined) as AccessBlocker | undefined
    note.channel = optional(line(body.channel, 80))
  } else {
    note.programme = programme
    note.language = optional(line(body.language, 60))
  }

  return { ok: true, spam: false, note }
}

function blockerLabel(id: AccessBlocker | undefined): string {
  return ACCESS_BLOCKERS.find((item) => item.id === id)?.label ?? 'Picture trouble'
}

function quote(value: string): string {
  return value
    .split('\n')
    .map((entry) => `> ${entry.replace(/```/g, "'''")}`)
    .join('\n')
}

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`
}

export function feedbackIssue(
  note: FeedbackNote,
  meta: { userAgent?: string } = {},
): { title: string; body: string } {
  const title =
    note.kind === 'channel'
      ? clip(`Channel: ${note.programme}${note.language ? ` (${note.language})` : ''}`, 120)
      : clip(
          `Access: ${blockerLabel(note.blocker)}${note.place ? ` — ${note.place}` : ''}`,
          120,
        )
  const lines = [
    note.kind === 'channel' ? '### Channel request' : '### Access report',
    '',
    note.blocker ? `**What got in the way:** ${blockerLabel(note.blocker)}` : '',
    note.channel ? `**Channel on screen:** ${note.channel}` : '',
    note.programme ? `**Programme:** ${note.programme}` : '',
    note.language ? `**Language:** ${note.language}` : '',
    note.link ? `**Link:** ${note.link}` : '',
    note.place ? `**Watching from:** ${note.place}` : '',
    note.page ? `**Page:** ${note.page}` : '',
    note.locale ? `**Browser language:** ${note.locale}` : '',
    note.timezone ? `**Time zone:** ${note.timezone}` : '',
    '',
    quote(note.message),
    '',
    `**Name:** ${note.name || 'not given'}`,
    `**Reply to:** ${note.email || 'not given'}`,
    '',
    'Sent from the 1988.in station form.',
    meta.userAgent ? `Browser: ${clip(meta.userAgent, 300)}` : '',
  ]
  return { title, body: lines.filter((entry) => entry !== '').join('\n') }
}
