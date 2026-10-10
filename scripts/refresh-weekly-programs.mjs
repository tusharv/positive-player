import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { CHANNELS } from '../src/data/channels.ts'
import {
  archiveCatalogs,
  mergeCatalog,
  auditCatalog,
  catalogItemFromVideo,
} from './weekly-catalog.mjs'
import { writeProgramBundles } from './write-program-bundles.mjs'

try {
  process.loadEnvFile('.env.local')
} catch {
  /* exported key also works */
}
const key = process.env.VITE_YOUTUBE_API_KEY
if (!key) throw new Error('Set VITE_YOUTUBE_API_KEY')
const root = new URL('../', import.meta.url)
const cache = new URL('.content-refresh/', root)
mkdirSync(cache, { recursive: true })
const previous = Object.fromEntries(
  CHANNELS.map((c) => [
    c.name,
    JSON.parse(
      readFileSync(
        new URL(`src/data/programs/${String(c.number).padStart(3, '0')}.json`, root),
        'utf8',
      ),
    ),
  ]),
)
const archiveName = process.env.CONTENT_ARCHIVE ?? new Date().toISOString().replace(/[:.]/g, '-')
archiveCatalogs(
  fileURLToPath(new URL('docs/content-history/', root)),
  archiveName,
  CHANNELS,
  previous,
)
let requests = 0
let quota = false
async function api(resource, params) {
  const fingerprint = createHash('sha256')
    .update(JSON.stringify([resource, params]))
    .digest('hex')
  const file = new URL(`${fingerprint}.json`, cache)
  if (existsSync(file) && Date.now() - JSON.parse(readFileSync(file, 'utf8')).savedAt < 86400000)
    return JSON.parse(readFileSync(file, 'utf8')).body
  if (quota) throw new Error('YouTube quota exhausted')
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`)
  url.search = new URLSearchParams({ ...params, key })
  requests++
  const response = await fetch(url, {
    headers: { Referer: process.env.YOUTUBE_REFERER ?? 'https://www.1988.in/' },
    signal: AbortSignal.timeout(20000),
  })
  const body = await response.json()
  if (!response.ok) {
    if (body.error?.errors?.some((e) => /quota|dailyLimit/i.test(e.reason))) quota = true
    throw new Error(
      `YouTube ${response.status}: ${body.error?.errors?.map((e) => e.reason).join(', ') ?? 'request failed'}`,
    )
  }
  writeFileSync(file, JSON.stringify({ savedAt: Date.now(), body }))
  return body
}
async function metadata(ids, channel, preserveShorts = false) {
  const result = []
  for (let offset = 0; offset < ids.length; offset += 50) {
    const data = await api('videos', {
      part: 'contentDetails,status,snippet',
      id: ids.slice(offset, offset + 50).join(','),
    })
    for (const item of data.items ?? []) {
      const candidate = catalogItemFromVideo(item, {
        channelName: channel.name,
        titleTerms: preserveShorts ? [] : channel.titleTerms,
        minimumDuration: preserveShorts ? 1 : 60,
      })
      if (candidate) result.push(candidate)
    }
  }
  return result
}
const supplementFile = new URL('scripts/weekly-supplements.json', root)
const supplements = existsSync(supplementFile)
  ? JSON.parse(readFileSync(supplementFile, 'utf8'))
  : {}
const catalogs = { ...previous }
const report = []
async function collect(channel) {
  const before = previous[channel.name]
  const oldIds = new Set(before.map((item) => item.videoId))
  let items = []
  let error
  let pages = 0
  try {
    const checked = await metadata([...oldIds], channel, true)
    // Keep editorial labels but discard entries metadata confirmed unavailable.
    const checkedIds = new Set(checked.map((item) => item.videoId))
    items = mergeCatalog(
      before.filter((item) => checkedIds.has(item.videoId)),
      checked,
    )
    const extraIds = (supplements[channel.name] ?? []).map((item) => item.videoId)
    if (extraIds.length) items = mergeCatalog(items, await metadata(extraIds, channel))
    let pageToken
    // Formula's publisher blocks iframe playback despite positive metadata.
    // Preserve its checked alternatives until additional sources are curated.
    if (channel.playlistId && channel.name !== 'Formula') {
      do {
        const data = await api('playlistItems', {
          part: 'contentDetails',
          maxResults: '50',
          playlistId: channel.playlistId,
          ...(pageToken ? { pageToken } : {}),
        })
        pages++
        const ids = (data.items ?? []).map((item) => item.contentDetails?.videoId).filter(Boolean)
        const known = new Set(items.map((item) => item.videoId))
        const fresh = await metadata(
          [...new Set(ids)].filter((id) => !known.has(id)),
          channel,
        )
        items = mergeCatalog(items, fresh)
        pageToken = data.nextPageToken
      } while (pageToken && !auditCatalog(items).ready && pages < 100)
    }
  } catch (e) {
    error = e.message
  }
  if (!items.length && !error) error = 'No validated playable videos; previous bundle retained'
  // Never erase a channel on a failed validation, and never pad duration.
  if (items.length)
    catalogs[channel.name] = mergeCatalog(
      before.filter((old) => items.some((item) => item.videoId === old.videoId)),
      items,
    )
  const after = auditCatalog(catalogs[channel.name])
  report.push({
    number: channel.number,
    name: channel.name,
    ...after,
    newVideos: catalogs[channel.name].filter((item) => !oldIds.has(item.videoId)).length,
    newSeconds: catalogs[channel.name]
      .filter((item) => !oldIds.has(item.videoId))
      .reduce((sum, item) => sum + item.durationSeconds, 0),
    playlistId: channel.playlistId,
    pages,
    ...(error ? { error } : {}),
  })
  writeFileSync(new URL('progress.json', cache), JSON.stringify({ catalogs, report }, null, 2))
  console.log(
    `${channel.number} ${channel.name}: ${(after.seconds / 3600).toFixed(1)}h, ${after.videos} videos, ${after.ready ? 'READY' : 'SHORT'}${error ? ` (${error})` : ''}`,
  )
}
const pending = [...CHANNELS]
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (pending.length) await collect(pending.shift())
  }),
)
report.sort((a, b) => a.number - b.number)
writeFileSync(
  new URL('docs/weekly-content-audit.json', root),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      targetHours: 168,
      archive: archiveName,
      requests,
      ready: report.filter((row) => row.ready && !row.error).length,
      channels: report,
    },
    null,
    2,
  ) + '\n',
)
// Explicit refresh is allowed to improve incomplete channels. The audit remains
// nonzero until every channel passes; a partial result must not be called a week.
writeProgramBundles(CHANNELS, catalogs, new URL('src/data/', root))
console.log(
  `Updated bundles. ${report.filter((r) => r.ready && !r.error).length}/${CHANNELS.length} metadata-checked channels cover 168h. ${requests} requests.`,
)
if (report.some((row) => !row.ready || row.error)) process.exitCode = 2
