import type { Channel } from '../data/channels'
import type { CatalogItem } from './broadcastClock'

export class MissingApiKeyError extends Error {
  constructor() {
    super('VITE_YOUTUBE_API_KEY is missing')
    this.name = 'MissingApiKeyError'
  }
}

export class CatalogFetchError extends Error {
  constructor(message = 'catalog fetch failed') {
    super(message)
    this.name = 'CatalogFetchError'
  }
}

export class QuotaExceededError extends CatalogFetchError {
  constructor() {
    super('YouTube search quota exceeded')
    this.name = 'QuotaExceededError'
  }
}

export type CatalogStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export type FetchCatalogOptions = {
  apiKey: string
  fetchFn: typeof fetch
  storage?: CatalogStorage
  excludeIds?: string[]
  onPlayable?: (items: CatalogItem[]) => void
}

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
const PLAYLIST_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos'
const QUOTA_KEY = 'pp-youtube-quota-until'
export const CATALOG_TTL_MS = 24 * 60 * 60 * 1000
const EXHAUSTED_REFRESH_COOLDOWN_MS = 5 * 60 * 1000
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000

type CachedCatalog = {
  items: CatalogItem[]
  fetchedAt: number
  exhaustedRefreshAt?: number
}

export function parseIsoDuration(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}

export function channelCatalogKey(channel: Channel): string {
  const source =
    channel.kind === 'curated'
      ? (channel.curatedVersion ?? channel.curatedCatalog?.map((item) => item.videoId).join(','))
      : channel.kind === 'playlist'
        ? channel.playlistId
        : channel.query
  return `pp-catalog-${channel.number}-${channel.kind}-${encodeURIComponent(source ?? '')}${channel.titleTerms?.length ? `-topics-${encodeURIComponent(channel.titleTerms.join('|'))}` : ''}`
}

function readCached(raw: string | null): CachedCatalog | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return { items: parsed as CatalogItem[], fetchedAt: 0 }
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as CachedCatalog).items) &&
      typeof (parsed as CachedCatalog).fetchedAt === 'number'
    ) {
      return parsed as CachedCatalog
    }
  } catch {
    /* Ignore broken cache rows and fetch again. */
  }
  return null
}

// A stale but playable station catalog can start a tune immediately while
// fetchChannelCatalog refreshes it. Never extend its persisted freshness here.
export function readChannelCatalog(channel: Channel, storage: CatalogStorage): CatalogItem[] {
  return (
    readCached(storage.getItem(channelCatalogKey(channel)))?.items ??
    (channel.kind === 'curated' ? (channel.curatedCatalog ?? []) : [])
  )
}

function quotaBlocked(storage?: CatalogStorage, now = Date.now()): boolean {
  const until = Number(storage?.getItem(QUOTA_KEY) ?? 0)
  return Number.isFinite(until) && until > now
}

function markQuota(storage?: CatalogStorage, now = Date.now()) {
  storage?.setItem(QUOTA_KEY, String(now + QUOTA_COOLDOWN_MS))
}

function isQuotaError(status: number, body: unknown): boolean {
  if (status === 429) return true
  const error = (body as { error?: { code?: number; status?: string } } | null)?.error
  return error?.code === 429 || error?.status === 'RESOURCE_EXHAUSTED'
}

async function readJson(fetchFn: typeof fetch, url: string): Promise<unknown> {
  const response = await fetchFn(url)
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    if (isQuotaError(response.status, body)) throw new QuotaExceededError()
    throw new CatalogFetchError(`HTTP ${response.status}`)
  }
  return body
}

type SearchResponse = {
  nextPageToken?: string
  items?: Array<{ id?: { videoId?: string }; contentDetails?: { videoId?: string } }>
}

type VideosResponse = {
  items?: Array<{
    id?: string
    snippet?: { title?: string }
    status?: { embeddable?: boolean }
    contentDetails?: { duration?: string }
  }>
}

async function collectVideoIds(
  channel: Channel,
  apiKey: string,
  fetchFn: typeof fetch,
  pageToken?: string,
): Promise<{ ids: string[]; nextPageToken?: string }> {
  if (channel.kind === 'curated') {
    const offset = Number(pageToken ?? 0)
    const items = channel.curatedCatalog ?? []
    return {
      ids: items.slice(offset, offset + 50).map((item) => item.videoId),
      ...(offset + 50 < items.length ? { nextPageToken: String(offset + 50) } : {}),
    }
  }
  if (channel.kind === 'playlist') {
    if (!channel.playlistId) return { ids: [] }
    const url = new URL(PLAYLIST_URL)
    url.searchParams.set('part', 'contentDetails')
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('playlistId', channel.playlistId)
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    url.searchParams.set('key', apiKey)
    const data = (await readJson(fetchFn, url.toString())) as SearchResponse
    return {
      ids: (data.items ?? [])
        .map((item) => item.contentDetails?.videoId)
        .filter((id): id is string => Boolean(id)),
      nextPageToken: data.nextPageToken,
    }
  }

  if (!channel.query) return { ids: [] }
  const url = new URL(SEARCH_URL)
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('safeSearch', 'strict')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('videoSyndicated', 'true')
  url.searchParams.set('maxResults', '25')
  url.searchParams.set('q', channel.query)
  url.searchParams.set('key', apiKey)
  const data = (await readJson(fetchFn, url.toString())) as SearchResponse
  return {
    ids: (data.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id)),
  }
}

async function fetchSourceCatalog(
  channel: Channel,
  options: FetchCatalogOptions,
): Promise<CatalogItem[]> {
  const key = channelCatalogKey(channel)
  const cached = readCached(options.storage?.getItem(key) ?? null)
  if (!options.apiKey) {
    if (channel.kind === 'curated') return cached?.items ?? channel.curatedCatalog ?? []
    throw new MissingApiKeyError()
  }
  // Remember a successful validation with no playable videos briefly, too.
  if (
    channel.kind === 'curated' &&
    cached &&
    !cached.items.length &&
    Date.now() - cached.fetchedAt < EXHAUSTED_REFRESH_COOLDOWN_MS
  )
    return []
  const fresh = cached?.items.length && Date.now() - cached.fetchedAt < CATALOG_TTL_MS
  const exhausted =
    cached?.items.length &&
    !cached.items.some((item) => !options.excludeIds?.includes(item.videoId))
  if (fresh && !exhausted) return cached.items
  if (
    exhausted &&
    cached.exhaustedRefreshAt !== undefined &&
    Date.now() - cached.exhaustedRefreshAt < EXHAUSTED_REFRESH_COOLDOWN_MS
  )
    return cached.items
  if (cached && quotaBlocked(options.storage) && channel.kind === 'search') return cached.items

  try {
    if (channel.kind === 'search' && quotaBlocked(options.storage)) throw new QuotaExceededError()

    // Try to replace failed videos once, then back off even if the publisher
    // returns the same videos, an empty feed, or an error.
    if (exhausted) {
      cached.exhaustedRefreshAt = Date.now()
      options.storage?.setItem(key, JSON.stringify(cached))
    }
    const catalog: CatalogItem[] = []
    const curatedTitles = new Map(
      channel.kind === 'curated'
        ? channel.curatedCatalog?.map((item) => [item.videoId, item.title])
        : [],
    )
    let pageToken: string | undefined
    let notified = false
    // Look past Shorts-heavy pages, but cap requests for empty/unavailable feeds.
    const pageLimit =
      channel.kind === 'curated' ? Math.ceil((channel.curatedCatalog?.length ?? 0) / 50) : 10
    for (let page = 0; page < pageLimit; page++) {
      const result = await collectVideoIds(channel, options.apiKey, options.fetchFn, pageToken)
      if (result.ids.length) {
        const url = new URL(VIDEOS_URL)
        url.searchParams.set('part', 'contentDetails,status,snippet')
        url.searchParams.set('id', result.ids.join(','))
        url.searchParams.set('key', options.apiKey)
        const data = (await readJson(options.fetchFn, url.toString())) as VideosResponse
        const videos = data.items ?? []
        if (channel.kind === 'curated') {
          const order = new Map(result.ids.map((id, index) => [id, index]))
          videos.sort(
            (a, b) => (order.get(a.id ?? '') ?? Infinity) - (order.get(b.id ?? '') ?? Infinity),
          )
        }
        for (const item of videos) {
          if (!item.id || item.status?.embeddable === false) continue
          if (
            channel.titleTerms?.length &&
            !channel.titleTerms.some((term) =>
              item.snippet?.title?.toLowerCase().includes(term.toLowerCase()),
            )
          )
            continue
          const durationSeconds = parseIsoDuration(item.contentDetails?.duration ?? '')
          // Short vintage ad spots are intentional in a curated schedule.
          const minimumDuration = channel.kind === 'curated' ? 1 : 60
          if (
            durationSeconds < minimumDuration ||
            catalog.some((video) => video.videoId === item.id)
          )
            continue
          const title = curatedTitles.get(item.id) ?? item.snippet?.title
          catalog.push({
            videoId: item.id,
            durationSeconds,
            ...(title ? { title } : {}),
          })
        }
      }
      if (!notified && catalog.some((item) => !options.excludeIds?.includes(item.videoId))) {
        notified = true
        options.onPlayable?.(catalog.filter((item) => !options.excludeIds?.includes(item.videoId)))
      }
      pageToken = result.nextPageToken
      if (
        (channel.kind !== 'curated' &&
          catalog.filter((item) => !options.excludeIds?.includes(item.videoId)).length >= 250) ||
        !pageToken
      )
        break
    }
    if (!catalog.length && channel.kind !== 'curated') return cached?.items ?? []

    options.storage?.setItem(
      key,
      JSON.stringify({
        items: catalog,
        fetchedAt: Date.now(),
        exhaustedRefreshAt: cached?.exhaustedRefreshAt,
      }),
    )
    return catalog
  } catch (error) {
    if (error instanceof QuotaExceededError) markQuota(options.storage)
    if (cached) return cached.items
    if (channel.kind === 'curated') {
      const items = channel.curatedCatalog ?? []
      options.storage?.setItem(
        key,
        JSON.stringify({
          items,
          fetchedAt: 0,
          ...(items.length && items.every((item) => options.excludeIds?.includes(item.videoId))
            ? { exhaustedRefreshAt: Date.now() }
            : {}),
        }),
      )
      return items
    }
    throw error
  }
}

// A station must never silently play another station's programming.
export async function fetchChannelCatalog(
  channel: Channel,
  options: FetchCatalogOptions,
): Promise<CatalogItem[]> {
  try {
    if (channel.kind === 'curated' && channel.loadCuratedCatalog && !channel.curatedCatalog) {
      const cached = readCached(options.storage?.getItem(channelCatalogKey(channel)) ?? null)
      if (
        cached &&
        (!options.apiKey ||
          (Date.now() - cached.fetchedAt < CATALOG_TTL_MS &&
            cached.items.some((item) => !options.excludeIds?.includes(item.videoId))))
      ) {
        return cached.items.filter((item) => !options.excludeIds?.includes(item.videoId))
      }
      try {
        channel = { ...channel, curatedCatalog: await channel.loadCuratedCatalog() }
      } catch (error) {
        if (cached)
          return cached.items.filter((item) => !options.excludeIds?.includes(item.videoId))
        throw error
      }
      // Start as soon as this station's bundle arrives, even if the API is stalled.
      // Respect a cached validation (including an empty catalog) over bundled data.
      const initial = readChannelCatalog(
        channel,
        options.storage ?? {
          getItem: () => null,
          setItem: () => {},
        },
      ).filter((item) => !options.excludeIds?.includes(item.videoId))
      if (initial.length) options.onPlayable?.(initial)
    }
    const catalog = await fetchSourceCatalog(channel, options)
    return catalog.filter((item) => !options.excludeIds?.includes(item.videoId))
  } catch (error) {
    if (error instanceof CatalogFetchError && error.message === 'HTTP 404') return []
    throw error
  }
}
