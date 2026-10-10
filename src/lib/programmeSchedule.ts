import { pickBroadcast, type CatalogItem } from './broadcastClock'

export type ProgrammeListing = CatalogItem & { startsAt: number; endsAt: number }

export function programmeSchedule(catalog: CatalogItem[], now: number): ProgrammeListing[] {
  const items = catalog.filter(
    (item) => Number.isFinite(item.durationSeconds) && item.durationSeconds >= 1,
  )
  if (!items.length || !Number.isFinite(now)) return []
  const rows: ProgrammeListing[] = []
  const until = Math.floor(now) + 86400
  let cursor = Math.floor(now)
  while (cursor < until) {
    const slot = pickBroadcast(items, cursor)
    const item = items.find((candidate) => candidate.videoId === slot?.videoId)
    if (!slot || !item) break
    const endsAt = cursor + item.durationSeconds - slot.startSeconds
    if (endsAt <= cursor) break
    rows.push({ ...item, startsAt: rows.length ? cursor : cursor - slot.startSeconds, endsAt })
    cursor = endsAt
  }
  return rows
}

export function programmeDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h${minutes % 60 ? ` ${minutes % 60}m` : ''}` : `${minutes}m`
}
