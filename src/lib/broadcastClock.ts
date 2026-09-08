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
  const items = catalog.filter(
    (item) => item.durationSeconds > 0 && !excludeIds.includes(item.videoId),
  )
  const loopLength = items.reduce((sum, item) => sum + item.durationSeconds, 0)
  if (loopLength <= 0) return null

  let offset = ((Math.floor(utcSeconds) % loopLength) + loopLength) % loopLength
  for (const item of items) {
    if (offset < item.durationSeconds) {
      return { videoId: item.videoId, startSeconds: offset }
    }
    offset -= item.durationSeconds
  }
  return null
}
