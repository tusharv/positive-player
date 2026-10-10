import { expect, it, vi } from 'vitest'
import { CHANNELS } from '../data/channels'
import { fetchChannelCatalog } from '../lib/youtubeData'

it.each(CHANNELS)('$name can schedule without an API key or browser cache', async (channel) => {
  const fetchFn = vi.fn(() => Promise.reject(new Error('API unavailable')))
  expect(channel.kind, channel.name).toBe('curated')
  const catalog = await fetchChannelCatalog(channel, { apiKey: '', fetchFn })
  expect(catalog.length, channel.name).toBeGreaterThanOrEqual(3)
  expect(new Set(catalog.map((item) => item.videoId)).size).toBe(catalog.length)
  for (const item of catalog) {
    expect(item.videoId).toMatch(/^[\w-]{11}$/)
    const isShortVintageSpot =
      channel.number === 13 || (channel.number === 5 && item.title?.startsWith('Vintage ads —'))
    expect(item.durationSeconds).toBeGreaterThanOrEqual(isShortVintageSpot ? 1 : 60)
    expect(item.title?.length).toBeGreaterThan(0)
  }
  expect(fetchFn).not.toHaveBeenCalled()
})

it.each(CHANNELS)('keeps $name programming when the API fails', async (channel) => {
  const catalog = await fetchChannelCatalog(channel, {
    apiKey: 'unavailable-key',
    fetchFn: async () => new Response(JSON.stringify({ error: { code: 403 } }), { status: 403 }),
  })
  expect(catalog, channel.name).toEqual(await channel.loadCuratedCatalog!())
  const first = catalog[0]!
  const remaining = await fetchChannelCatalog(channel, {
    apiKey: '',
    fetchFn: fetch,
    excludeIds: [first.videoId],
  })
  expect(remaining.some((item) => item.videoId === first.videoId)).toBe(false)
  expect(remaining.length, channel.name).toBeGreaterThan(0)
})
