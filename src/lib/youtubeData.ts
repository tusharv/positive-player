import { type Channel } from '../data/channels'
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
}

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
const PLAYLIST_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos'
const QUOTA_KEY = 'pp-youtube-quota-until'
export const CATALOG_TTL_MS = 24 * 60 * 60 * 1000
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000

type CachedCatalog = {
  items: CatalogItem[]
  fetchedAt: number
}

export function parseIsoDuration(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}

function cacheKey(channel: Channel): string {
  const source = channel.kind === 'playlist' ? channel.playlistId : channel.query
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
  if (!options.apiKey) throw new MissingApiKeyError()

  const key = cacheKey(channel)
  const cached = readCached(options.storage?.getItem(key) ?? null)
  const fresh = cached?.items.length && Date.now() - cached.fetchedAt < CATALOG_TTL_MS
  if (fresh) return cached.items
  if (cached && quotaBlocked(options.storage) && channel.kind !== 'playlist') return cached.items

  try {
    if (channel.kind !== 'playlist' && quotaBlocked(options.storage)) throw new QuotaExceededError()

    const catalog: CatalogItem[] = []
    let pageToken: string | undefined
    // Look past Shorts-heavy pages, but cap requests for empty/unavailable feeds.
    for (let page = 0; page < 10; page++) {
      const result = await collectVideoIds(channel, options.apiKey, options.fetchFn, pageToken)
      if (result.ids.length) {
        const url = new URL(VIDEOS_URL)
        url.searchParams.set('part', 'contentDetails,status,snippet')
        url.searchParams.set('id', result.ids.join(','))
        url.searchParams.set('key', options.apiKey)
        const data = (await readJson(options.fetchFn, url.toString())) as VideosResponse
        for (const item of data.items ?? []) {
          if (!item.id || item.status?.embeddable === false) continue
          if (
            channel.titleTerms?.length &&
            !channel.titleTerms.some((term) =>
              item.snippet?.title?.toLowerCase().includes(term.toLowerCase()),
            )
          )
            continue
          const durationSeconds = parseIsoDuration(item.contentDetails?.duration ?? '')
          if (durationSeconds < 60 || catalog.some((video) => video.videoId === item.id)) continue
          catalog.push({ videoId: item.id, durationSeconds })
        }
      }
      pageToken = result.nextPageToken
      if (
        catalog.filter((item) => !options.excludeIds?.includes(item.videoId)).length >= 250 ||
        !pageToken
      )
        break
    }
    if (!catalog.length) return cached?.items ?? []

    options.storage?.setItem(key, JSON.stringify({ items: catalog, fetchedAt: Date.now() }))
    return catalog
  } catch (error) {
    if (error instanceof QuotaExceededError) markQuota(options.storage)
    if (cached) return cached.items
    throw error
  }
}

// A station must never silently play another station's programming.
export async function fetchChannelCatalog(
  channel: Channel,
  options: FetchCatalogOptions,
): Promise<CatalogItem[]> {
  try {
    const catalog = await fetchSourceCatalog(channel, options)
    return catalog.filter((item) => !options.excludeIds?.includes(item.videoId))
  } catch (error) {
    if (error instanceof CatalogFetchError && error.message === 'HTTP 404') return []
    throw error
  }
}
