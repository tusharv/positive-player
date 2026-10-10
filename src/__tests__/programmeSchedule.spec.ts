import { describe, expect, it } from 'vitest'
import { programmeSchedule } from '../lib/programmeSchedule'

describe('24-hour programme guide', () => {
  const catalog = [
    { videoId: 'a', title: 'First', durationSeconds: 60000 },
    { videoId: 'b', title: 'Second', durationSeconds: 60000 },
  ]
  it('includes the current programme and covers the entire next 24 hours without gaps', () => {
    const rows = programmeSchedule(catalog, 10000)
    expect(rows[0]).toMatchObject({ videoId: 'a', startsAt: 0, endsAt: 60000 })
    expect(rows[rows.length - 1]!.endsAt).toBeGreaterThanOrEqual(96400)
    expect(
      rows.every((row, index) => index === 0 || row.startsAt === rows[index - 1]!.endsAt),
    ).toBe(true)
    expect(rows.every((row) => row.startsAt < 96400)).toBe(true)
  })
  it('keeps a playing short-loop programme through midnight, then follows the new day clock', () => {
    const rows = programmeSchedule(
      [
        { videoId: 'a', durationSeconds: 500 },
        { videoId: 'b', durationSeconds: 500 },
      ],
      86300,
    )
    expect(rows[0]).toMatchObject({ videoId: 'a', startsAt: 86000, endsAt: 86500 })
    expect(rows[1]).toMatchObject({ videoId: 'b', startsAt: 86500, endsAt: 86900 })
  })
  it('ignores unusable durations and handles an empty channel', () => {
    expect(programmeSchedule([], 0)).toEqual([])
    expect(programmeSchedule([{ videoId: 'bad', durationSeconds: Infinity }], 0)).toEqual([])
  })
})
