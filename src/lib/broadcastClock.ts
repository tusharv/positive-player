export type CatalogItem = {
  videoId: string
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
): BroadcastSlot | null {
  const playable = catalog.filter(
    (item) => item.durationSeconds > 0 && !excludeIds.includes(item.videoId),
  )
  if (!playable.length) return null
  // Rotate the starting programme each UTC day. All viewers with the same
  // catalog still share a clock, without repeating the same daily timetable.
  const day = Math.floor(utcSeconds / 86400)
  const first = ((day % playable.length) + playable.length) % playable.length
  const items = [...playable.slice(first), ...playable.slice(0, first)]
  const loopLength = items.reduce((sum, item) => sum + item.durationSeconds, 0)
  if (loopLength <= 0) return null

  let offset = (((Math.floor(utcSeconds) - day * 86400) % loopLength) + loopLength) % loopLength
  for (const item of items) {
    if (offset < item.durationSeconds) {
      return { videoId: item.videoId, startSeconds: offset }
    }
    offset -= item.durationSeconds
  }
  return null
}
