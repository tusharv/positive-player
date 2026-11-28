import { describe, expect, it } from 'vitest'
import { feedbackIssue, parseFeedback } from '../lib/feedback'

const channelNote = {
  kind: 'channel',
  programme: 'Malgudi Days',
  language: 'Kannada',
  place: 'Bengaluru',
  message: 'Please put the old episodes on the dial.',
  email: 'viewer@example.com',
  page: '/contact?code=secret',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
}

describe('parseFeedback', () => {
  it('accepts an access report and drops a page that is not a path', () => {
    const parsed = parseFeedback({
      kind: 'access',
      blocker: 'region',
      channel: '013',
      place: 'Nairobi',
      message: 'The picture never starts on this channel.',
      page: '/watch?pair=secret',
      locale: 'not a locale',
    })
    expect(parsed.ok).toBe(true)
    if (!parsed.ok || parsed.spam) return
    expect(parsed.note).toMatchObject({
      kind: 'access',
      blocker: 'region',
      channel: '013',
      place: 'Nairobi',
    })
    expect(parsed.note.page).toBeUndefined()
    expect(parsed.note.locale).toBeUndefined()
  })

  it('asks for a programme name and a real link', () => {
    expect(
      parseFeedback({
        kind: 'channel',
        message: 'Please add this show for us.',
      }),
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/Name the channel/),
      fields: expect.arrayContaining([
        expect.objectContaining({ field: 'programme' }),
      ]),
    })
    expect(
      parseFeedback({
        kind: 'channel',
        programme: 'Fado night',
        link: 'javascript:alert(1)',
        message: 'A live recording from Lisbon.',
      }),
    ).toMatchObject({ ok: false, error: expect.stringMatching(/http/) })
  })

  it('treats a filled trap as spam and keeps the note off the issue', () => {
    const parsed = parseFeedback({ ...channelNote, pp_leave_blank: 'https://spam.example' })
    expect(parsed).toEqual({ ok: true, spam: true })
  })
})

describe('feedbackIssue', () => {
  it('names the request and keeps the reply address in the note', () => {
    const parsed = parseFeedback(channelNote)
    if (!parsed.ok || parsed.spam) throw new Error('expected a note')
    const issue = feedbackIssue(parsed.note, { userAgent: 'TestBrowser/1' })
    expect(issue.title).toBe('Channel: Malgudi Days (Kannada)')
    expect(issue.body).toContain('viewer@example.com')
    expect(issue.body).toContain('Bengaluru')
    expect(issue.body).toContain('TestBrowser/1')
    expect(issue.body).not.toContain('127.0.0.1')
  })
})
