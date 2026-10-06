import { describe, it, expect } from 'vitest'
import { pickBroadcast, type CatalogItem } from '../lib/broadcastClock'

const catalog: CatalogItem[] = [
  { videoId: 'a', durationSeconds: 100 },
  { videoId: 'b', durationSeconds: 50 },
]

describe('pickBroadcast', () => {
  it('returns the same slot for a fixed timestamp', () => {
    expect(pickBroadcast(catalog, 10)).toEqual({ videoId: 'a', startSeconds: 10 })
    expect(pickBroadcast(catalog, 10)).toEqual({ videoId: 'a', startSeconds: 10 })
  })

  it('crosses a video boundary onto the next item', () => {
    expect(pickBroadcast(catalog, 100)).toEqual({ videoId: 'b', startSeconds: 0 })
  })

  it('wraps past the last video to the first', () => {
    expect(pickBroadcast(catalog, 160)).toEqual({ videoId: 'a', startSeconds: 10 })
  })

  it('returns null for an empty catalog', () => {
    expect(pickBroadcast([], 10)).toBeNull()
  })

  it('skips excluded ids and picks from what remains', () => {
    expect(pickBroadcast(catalog, 10, ['a'])).toEqual({ videoId: 'b', startSeconds: 10 })
  })
})

it('varies the same viewing time across next week even when the catalog loop divides a day', () => {
  const videos = Array.from({ length: 12 }, (_, i) => ({
    videoId: String(i),
    durationSeconds: 600,
  }))
  const monday = Date.UTC(2026, 9, 12, 18) / 1000
  const slots = Array.from(
    { length: 7 },
    (_, day) => pickBroadcast(videos, monday + day * 86400)!.videoId,
  )
  expect(new Set(slots).size).toBe(7)
  expect(pickBroadcast(videos, monday)).toEqual(pickBroadcast(videos, monday))
})

it('plays a multi-day catalogue continuously across midnight and wraps only at its end', () => {
  const month = Array.from({ length: 720 }, (_, i) => ({
    videoId: `hour-${i}`,
    durationSeconds: 3600,
  }))
  expect(pickBroadcast(month, 86399)).toEqual({ videoId: 'hour-23', startSeconds: 3599 })
  expect(pickBroadcast(month, 86400)).toEqual({ videoId: 'hour-24', startSeconds: 0 })
  expect(pickBroadcast(month, 29 * 86400)).toEqual({ videoId: 'hour-696', startSeconds: 0 })
  expect(pickBroadcast(month, 30 * 86400)).toEqual({ videoId: 'hour-0', startSeconds: 0 })
})

it('advances past a just-ended video without compressing a multi-day schedule', () => {
  const month = Array.from({ length: 720 }, (_, i) => ({
    videoId: `hour-${i}`,
    durationSeconds: 3600,
  }))
  // The player can finish just before the wall-clock second ticks over.
  expect(pickBroadcast(month, 7199, [], ['hour-1'])).toEqual({ videoId: 'hour-2', startSeconds: 0 })
  expect(pickBroadcast(month, 7200, [], ['hour-1'])).toEqual({ videoId: 'hour-2', startSeconds: 0 })
})
