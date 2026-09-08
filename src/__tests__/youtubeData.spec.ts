import { describe, expect, it, vi } from 'vitest'
import {
  fetchChannelCatalog,
  parseIsoDuration,
  MissingApiKeyError,
  QuotaExceededError,
} from '../lib/youtubeData'
import type { Channel } from '../data/channels'

const nature: Channel = {
  number: 1,
  name: 'Nature',
  kind: 'search',
  tags: ['Earth', 'Calm'],
  query: 'peaceful nature scenery',
}

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response)
}

function quotaResponse() {
  return Promise.resolve({
    ok: false,
    status: 429,
    json: () =>
      Promise.resolve({
        error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded' },
      }),
  } as Response)
}

function mapStorage(memory: Map<string, string>) {
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
  }
}

describe('parseIsoDuration', () => {
  it('parses PT1M40S as 100 seconds', () => {
    expect(parseIsoDuration('PT1M40S')).toBe(100)
  })
})

describe('fetchChannelCatalog', () => {
  it('throws when the api key is missing', async () => {
    await expect(
      fetchChannelCatalog(nature, { apiKey: '', fetchFn: globalThis.fetch }),
    ).rejects.toBeInstanceOf(MissingApiKeyError)
  })

  it('keeps embeddable videos and drops the rest', async () => {
    const fetchFn: typeof fetch = (input) => {
      const url = String(input)
      if (url.includes('search')) {
        return jsonResponse({
          items: [
            { id: { videoId: 'good' } },
            { id: { videoId: 'bad' } },
          ],
        })
      }
      return jsonResponse({
        items: [
          {
            id: 'good',
            status: { embeddable: true },
            contentDetails: { duration: 'PT1M40S' },
          },
          {
            id: 'bad',
            status: { embeddable: false },
            contentDetails: { duration: 'PT2M' },
          },
        ],
      })
    }

    const storage = {
      getItem: () => null,
      setItem: () => undefined,
    }

    const catalog = await fetchChannelCatalog(nature, { apiKey: 'key', fetchFn, storage })
    expect(catalog).toEqual([{ videoId: 'good', durationSeconds: 100 }])
  })

  it('plays a stale catalog when search quota is exhausted', async () => {
    const fetchFn = () => quotaResponse()
    const memory = new Map<string, string>([
      [
        'pp-catalog-1',
        JSON.stringify({
          items: [{ videoId: 'stale', durationSeconds: 50 }],
          fetchedAt: 0,
        }),
      ],
    ])
    const catalog = await fetchChannelCatalog(nature, {
      apiKey: 'key',
      fetchFn,
      storage: mapStorage(memory),
    })
    expect(catalog).toEqual([{ videoId: 'stale', durationSeconds: 50 }])
  })

  it('throws QuotaExceededError and skips later searches after a 429', async () => {
    const fetchFn = vi.fn(() => quotaResponse())
    const memory = new Map<string, string>()
    await expect(
      fetchChannelCatalog(nature, { apiKey: 'key', fetchFn, storage: mapStorage(memory) }),
    ).rejects.toBeInstanceOf(QuotaExceededError)
    await expect(
      fetchChannelCatalog(
        { ...nature, number: 2, query: 'calm ocean waves' },
        { apiKey: 'key', fetchFn, storage: mapStorage(memory) },
      ),
    ).rejects.toBeInstanceOf(QuotaExceededError)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('still loads playlists after search quota is exhausted', async () => {
    const fetchFn = vi
      .fn()
      .mockImplementationOnce(() => quotaResponse())
      .mockImplementation((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('playlistItems')) {
          return jsonResponse({ items: [{ contentDetails: { videoId: 'keys' } }] })
        }
        return jsonResponse({
          items: [
            {
              id: 'keys',
              status: { embeddable: true },
              contentDetails: { duration: 'PT2M' },
            },
          ],
        })
      })
    const memory = new Map<string, string>()
    await expect(
      fetchChannelCatalog(nature, { apiKey: 'key', fetchFn, storage: mapStorage(memory) }),
    ).rejects.toBeInstanceOf(QuotaExceededError)

    const piano: Channel = {
      number: 8,
      name: 'Piano',
      kind: 'playlist',
      tags: ['Music', 'Calm'],
      playlistId: 'UUtestUploads1234567890',
    }
    const catalog = await fetchChannelCatalog(piano, {
      apiKey: 'key',
      fetchFn: fetchFn as typeof fetch,
      storage: mapStorage(memory),
    })
    expect(catalog).toEqual([{ videoId: 'keys', durationSeconds: 120 }])
  })

  it('loads playlist channels without calling YouTube search', async () => {
    const piano: Channel = {
      number: 8,
      name: 'Piano',
      kind: 'playlist',
      tags: ['Music', 'Calm'],
      playlistId: 'UUtestUploads1234567890',
    }
    const fetchFn = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('playlistItems')) {
        return jsonResponse({ items: [{ contentDetails: { videoId: 'keys' } }] })
      }
      return jsonResponse({
        items: [
          {
            id: 'keys',
            status: { embeddable: true },
            contentDetails: { duration: 'PT2M' },
          },
        ],
      })
    })

    const catalog = await fetchChannelCatalog(piano, {
      apiKey: 'key',
      fetchFn: fetchFn as typeof fetch,
      storage: mapStorage(new Map()),
    })
    expect(catalog).toEqual([{ videoId: 'keys', durationSeconds: 120 }])
    expect(fetchFn.mock.calls.map(([input]) => String(input)).join('\n')).not.toContain('/search')
  })

  it('drops shorts from a playlist catalog', async () => {
    const piano: Channel = {
      number: 8,
      name: 'Piano',
      kind: 'playlist',
      tags: ['Music', 'Calm'],
      playlistId: 'UUtestUploads1234567890',
    }
    const fetchFn = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('playlistItems')) {
        return jsonResponse({
          items: [{ contentDetails: { videoId: 'short' } }, { contentDetails: { videoId: 'long' } }],
        })
      }
      return jsonResponse({
        items: [
          {
            id: 'short',
            status: { embeddable: true },
            contentDetails: { duration: 'PT20S' },
          },
          {
            id: 'long',
            status: { embeddable: true },
            contentDetails: { duration: 'PT3M' },
          },
        ],
      })
    })

    const catalog = await fetchChannelCatalog(piano, {
      apiKey: 'key',
      fetchFn: fetchFn as typeof fetch,
      storage: mapStorage(new Map()),
    })
    expect(catalog).toEqual([{ videoId: 'long', durationSeconds: 180 }])
  })
})
