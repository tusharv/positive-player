import { acceptsProgram } from './program-policy.mjs'
import { parseIsoDuration } from '../src/lib/youtubeData.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const WEEK_SECONDS = 7 * 24 * 60 * 60

export function mergeCatalog(previous, incoming) {
  const prior = new Map(previous.map((item) => [item.videoId, item]))
  const result = new Map()
  for (const item of [...incoming, ...previous]) {
    if (!item.videoId || !Number.isFinite(item.durationSeconds) || item.durationSeconds <= 0)
      continue
    if (result.has(item.videoId)) continue
    const old = prior.get(item.videoId)
    result.set(item.videoId, old?.title ? { ...item, title: old.title } : item)
  }
  return [...result.values()].sort(
    (a, b) => Number(prior.has(a.videoId)) - Number(prior.has(b.videoId)),
  )
}

export function auditCatalog(items) {
  const unique = mergeCatalog([], items)
  const seconds = unique.reduce((sum, item) => sum + item.durationSeconds, 0)
  return {
    videos: unique.length,
    seconds,
    missingSeconds: Math.max(0, WEEK_SECONDS - seconds),
    ready: seconds >= WEEK_SECONDS,
    duplicates: items.length - new Set(items.map((item) => item.videoId)).size,
  }
}

export function archiveCatalogs(root, name, channels, catalogs) {
  mkdirSync(root, { recursive: true })
  const directory = join(root, name)
  // Exclusive directory creation: historical snapshots are immutable.
  mkdirSync(directory)
  writeFileSync(join(directory, 'catalogs.json'), JSON.stringify(catalogs, null, 2) + '\n')
  writeFileSync(
    join(directory, 'manifest.json'),
    JSON.stringify(
      {
        archivedAt: new Date().toISOString(),
        channels: channels.map(({ number, name, playlistId, query, titleTerms }) => ({
          number,
          name,
          playlistId,
          query,
          titleTerms,
          ...auditCatalog(catalogs[name]),
        })),
      },
      null,
      2,
    ) + '\n',
  )
  return directory
}

export function catalogItemFromVideo(
  video,
  { channelName, titleTerms = [], minimumDuration = 60, region = 'IN' } = {},
) {
  const restriction = video.contentDetails?.regionRestriction
  if (
    !video.id ||
    video.status?.embeddable !== true ||
    video.status?.privacyStatus !== 'public' ||
    ['live', 'upcoming'].includes(video.snippet?.liveBroadcastContent) ||
    video.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted' ||
    restriction?.blocked?.includes(region) ||
    (restriction?.allowed && !restriction.allowed.includes(region))
  )
    return null
  const title = video.snippet?.title ?? ''
  if (!acceptsProgram(channelName, { title })) return null
  const durationSeconds = parseIsoDuration(video.contentDetails?.duration ?? '')
  if (
    durationSeconds < minimumDuration ||
    (titleTerms.length &&
      !titleTerms.some((term) => title.toLowerCase().includes(term.toLowerCase())))
  )
    return null
  return { videoId: video.id, title, durationSeconds }
}
