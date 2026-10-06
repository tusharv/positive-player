export type CatalogItem = {
  videoId: string
  title?: string
  durationSeconds: number
}

export type BroadcastSlot = {
  videoId: string
  startSeconds: number
}

export function pickBroadcast(
  catalog: CatalogItem[],
  utcSeconds: number,
  excludeIds: string[] = [],
  endedIds: string[] = [],
): BroadcastSlot | null {
  const playable = catalog.filter(
    (item) => item.durationSeconds > 0 && !excludeIds.includes(item.videoId),
  )
  if (!playable.length) return null
  const loopLength = playable.reduce((sum, item) => sum + item.durationSeconds, 0)
  if (loopLength <= 0) return null
  // Rotate the starting programme each UTC day. All viewers with the same
  // catalog still share a clock, without repeating the same daily timetable.
  const day = Math.floor(utcSeconds / 86400)
  const first = ((day % playable.length) + playable.length) % playable.length
  // Multi-day stations must traverse their entire catalogue without jumping
  // backwards at midnight. Short loops retain the daily variety above.
  const continuous = loopLength > 86400
  const items = continuous ? playable : [...playable.slice(first), ...playable.slice(0, first)]

  const elapsed = Math.floor(utcSeconds) - (continuous ? 0 : day * 86400)
  let offset = ((elapsed % loopLength) + loopLength) % loopLength
  for (const [index, item] of items.entries()) {
    if (offset < item.durationSeconds) {
      // A just-ended video is not broken. Do not remove its duration from the
      // timeline: doing so shifts every later slot in a multi-day broadcast.
      if (endedIds.includes(item.videoId)) {
        const next = [...items.slice(index + 1), ...items.slice(0, index)].find(
          (candidate) => !endedIds.includes(candidate.videoId),
        )
        if (next) return { videoId: next.videoId, startSeconds: 0 }
      }
      return { videoId: item.videoId, startSeconds: offset }
    }
    offset -= item.durationSeconds
  }
  return null
}
