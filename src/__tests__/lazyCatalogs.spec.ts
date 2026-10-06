import { expect, it, vi } from 'vitest'
import { CHANNELS, type Channel } from '../data/channels'
import { channelCatalogKey, fetchChannelCatalog, readChannelCatalog } from '../lib/youtubeData'

it('keeps programme arrays out of the channel index', () => {
  for (const channel of CHANNELS) {
    expect(channel.curatedCatalog, channel.name).toBeUndefined()
    expect(channel.loadCuratedCatalog, channel.name).toBeTypeOf('function')
    expect(channel.curatedVersion, channel.name).toBeTruthy()
  }
})

it('loads only the requested bundle and starts it before metadata validation finishes', async () => {
  const items = [{ videoId: 'lazy-video1', title: 'Programme', durationSeconds: 600 }]
  const selected: Channel = {
    number: 1,
    name: 'Selected',
    kind: 'curated',
    tags: [],
    curatedVersion: 'v1',
    loadCuratedCatalog: vi.fn(async () => items),
  }
  const other: Channel = { ...selected, number: 2, loadCuratedCatalog: vi.fn() }
  const onPlayable = vi.fn()
  let finish!: (response: Response) => void
  const fetchFn = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve
      }),
  )
  const key = channelCatalogKey(selected)
  expect(readChannelCatalog(selected, { getItem: () => null, setItem: () => {} })).toEqual([])
  expect(selected.loadCuratedCatalog).not.toHaveBeenCalled()
  const loading = fetchChannelCatalog(selected, { apiKey: 'key', fetchFn, onPlayable })
  await vi.waitFor(() => expect(onPlayable).toHaveBeenCalledWith(items))
  expect(other.loadCuratedCatalog).not.toHaveBeenCalled()
  expect(selected.curatedCatalog).toBeUndefined()
  expect(channelCatalogKey({ ...selected, curatedCatalog: items })).toBe(key)
  finish(new Response('{}', { status: 403 }))
  expect(await loading).toEqual(items)
})

it('invalidates cached programmes when the bundle version changes', () => {
  const channel: Channel = {
    number: 1,
    name: 'One',
    tags: [],
    kind: 'curated',
    curatedVersion: 'v1',
  }
  expect(channelCatalogKey(channel)).not.toBe(
    channelCatalogKey({ ...channel, curatedVersion: 'v2' }),
  )
})

it('reuses a fresh saved catalog without downloading its bundle or calling the API', async () => {
  const items = [{ videoId: 'saved-video', durationSeconds: 600 }]
  const channel: Channel = {
    number: 1,
    name: 'One',
    tags: [],
    kind: 'curated',
    curatedVersion: 'v1',
    loadCuratedCatalog: vi.fn(async () => {
      throw new Error('unnecessary download')
    }),
  }
  const fetchFn = vi.fn()
  const storage = {
    getItem: () => JSON.stringify({ items, fetchedAt: Date.now() }),
    setItem: () => {},
  }
  expect(await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn, storage })).toEqual(items)
  expect(channel.loadCuratedCatalog).not.toHaveBeenCalled()
  expect(fetchFn).not.toHaveBeenCalled()
})

it('keeps a stale saved catalog if its lazy file cannot be downloaded', async () => {
  const items = [{ videoId: 'saved-video', durationSeconds: 600 }]
  const channel: Channel = {
    number: 1,
    name: 'One',
    tags: [],
    kind: 'curated',
    curatedVersion: 'v1',
    loadCuratedCatalog: async () => {
      throw new Error('Network unavailable')
    },
  }
  const storage = { getItem: () => JSON.stringify({ items, fetchedAt: 0 }), setItem: () => {} }
  expect(await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn: vi.fn(), storage })).toEqual(
    items,
  )
})
