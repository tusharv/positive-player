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
          items: [{ id: { videoId: 'good' } }, { id: { videoId: 'bad' } }],
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
        'pp-catalog-1-search-peaceful%20nature%20scenery',
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
          items: [
            { contentDetails: { videoId: 'short' } },
            { contentDetails: { videoId: 'long' } },
          ],
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

it('does not reuse a catalog after its playlist changes or from the legacy number-only cache', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'PLold' }
  const memory = new Map<string, string>([
    [
      'pp-catalog-1',
      JSON.stringify({
        items: [{ videoId: 'unrelated', durationSeconds: 100 }],
        fetchedAt: Date.now(),
      }),
    ],
  ])
  const fetchFn: typeof fetch = (input) => {
    const url = new URL(String(input))
    if (url.pathname.endsWith('/playlistItems'))
      return jsonResponse({
        items: [{ contentDetails: { videoId: url.searchParams.get('playlistId') } }],
      })
    return jsonResponse({
      items: [
        {
          id: url.searchParams.get('id'),
          status: { embeddable: true },
          contentDetails: { duration: 'PT20M' },
        },
      ],
    })
  }
  const options = { apiKey: 'key', fetchFn, storage: mapStorage(memory) }
  expect(await fetchChannelCatalog(channel, options)).toEqual([
    { videoId: 'PLold', durationSeconds: 1200 },
  ])
  expect(await fetchChannelCatalog({ ...channel, playlistId: 'PLnew' }, options)).toEqual([
    { videoId: 'PLnew', durationSeconds: 1200 },
  ])
  expect(
    await fetchChannelCatalog(
      { ...channel, playlistId: 'PLnew' },
      {
        ...options,
        fetchFn: () => {
          throw new Error('cached catalog should be used')
        },
      },
    ),
  ).toEqual([{ videoId: 'PLnew', durationSeconds: 1200 }])
})

it('recovers an empty cached playlist by looking beyond a page of shorts', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'PLshorts' }
  const memory = new Map([
    ['pp-catalog-1-playlist-PLshorts', JSON.stringify({ items: [], fetchedAt: Date.now() })],
  ])
  const fetchFn: typeof fetch = (input) => {
    const url = new URL(String(input))
    if (url.pathname.endsWith('/playlistItems'))
      return jsonResponse(
        url.searchParams.has('pageToken')
          ? { items: [{ contentDetails: { videoId: 'long' } }] }
          : { items: [{ contentDetails: { videoId: 'short' } }], nextPageToken: 'page-two' },
      )
    return jsonResponse({
      items: [
        {
          id: url.searchParams.get('id'),
          status: { embeddable: true },
          contentDetails: { duration: url.searchParams.get('id') === 'short' ? 'PT20S' : 'PT10M' },
        },
      ],
    })
  }
  expect(
    await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn, storage: mapStorage(memory) }),
  ).toEqual([{ videoId: 'long', durationSeconds: 600 }])
})

it('does not substitute another channel when the primary playlist is unavailable', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'missing', category: 'Earth' }
  const fetchFn: typeof fetch = (input) => {
    const url = new URL(String(input))
    if (url.searchParams.get('playlistId') === 'missing')
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) } as Response)
    if (url.pathname.endsWith('/playlistItems'))
      return jsonResponse({ items: [{ contentDetails: { videoId: 'backup' } }] })
    return jsonResponse({
      items: [
        { id: 'backup', status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
      ],
    })
  }
  expect(await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn })).toEqual([])
})

it('refreshes the same playlist when every cached video has failed', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'broken', category: 'Earth' }
  const memory = new Map([
    [
      'pp-catalog-1-playlist-broken',
      JSON.stringify({ items: [{ videoId: 'bad', durationSeconds: 120 }], fetchedAt: Date.now() }),
    ],
  ])
  const fetchFn: typeof fetch = (input) =>
    String(input).includes('playlistItems')
      ? jsonResponse({ items: [{ contentDetails: { videoId: 'backup' } }] })
      : jsonResponse({
          items: [
            { id: 'backup', status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
          ],
        })
  expect(
    await fetchChannelCatalog(channel, {
      apiKey: 'key',
      fetchFn,
      storage: mapStorage(memory),
      excludeIds: ['bad'],
    }),
  ).toEqual([{ videoId: 'backup', durationSeconds: 600 }])
})

it('bounds pagination and does not cache an empty result', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'PLempty' }
  const memory = new Map<string, string>()
  let pages = 0
  const fetchFn: typeof fetch = async () => {
    pages++
    return { ok: true, json: async () => ({ items: [], nextPageToken: String(pages) }) } as Response
  }
  expect(
    await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn, storage: mapStorage(memory) }),
  ).toEqual([])
  expect(pages).toBe(10)
  expect(memory.size).toBe(0)
})

it('does not request backups for a missing playlist', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'missing', category: 'Earth' }
  const requested: string[] = []
  const fetchFn: typeof fetch = async (input) => {
    requested.push(new URL(String(input)).searchParams.get('playlistId')!)
    return { ok: false, status: 404, json: async () => ({}) } as Response
  }
  expect(await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn })).toEqual([])
  expect(requested).toHaveLength(1)
  expect(new Set(requested).size).toBe(1)
})

it('loads beyond five playable videos to build a varied catalog', async () => {
  const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'PLvariety' }
  const fetchFn: typeof fetch = async (input) => {
    const url = new URL(String(input))
    if (url.pathname.endsWith('/playlistItems')) {
      const second = url.searchParams.has('pageToken')
      return jsonResponse({
        items: (second ? ['f', 'g'] : ['a', 'b', 'c', 'd', 'e']).map((videoId) => ({
          contentDetails: { videoId },
        })),
        ...(second ? {} : { nextPageToken: 'second' }),
      })
    }
    return jsonResponse({
      items: url.searchParams
        .get('id')!
        .split(',')
        .map((id) => ({
          id,
          status: { embeddable: true },
          contentDetails: { duration: 'PT10M' },
        })),
    })
  }
  expect(
    (await fetchChannelCatalog(channel, { apiKey: 'key', fetchFn })).map((v) => v.videoId),
  ).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
})

it('refreshes yesterday’s catalog to include new uploads', async () => {
  const memory = new Map([
    [
      'pp-catalog-1-search-peaceful%20nature%20scenery',
      JSON.stringify({
        items: [{ videoId: 'yesterday', durationSeconds: 600 }],
        fetchedAt: Date.now() - 25 * 3600_000,
      }),
    ],
  ])
  const fetchFn: typeof fetch = async (input) =>
    String(input).includes('/search')
      ? jsonResponse({ items: [{ id: { videoId: 'today' } }] })
      : jsonResponse({
          items: [
            { id: 'today', status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
          ],
        })
  expect(
    await fetchChannelCatalog(nature, { apiKey: 'key', fetchFn, storage: mapStorage(memory) }),
  ).toEqual([{ videoId: 'today', durationSeconds: 600 }])
})

it('filters mixed publisher uploads to the station topic before caching', async () => {
  const channel: Channel = {
    ...nature,
    kind: 'playlist',
    playlistId: 'PLmixed',
    titleTerms: ['kyoto', '京都'],
  }
  const memory = new Map<string, string>()
  const fetchFn: typeof fetch = async (input) =>
    String(input).includes('playlistItems')
      ? jsonResponse({
          items: ['kyoto', 'tokyo', 'unknown'].map((videoId) => ({ contentDetails: { videoId } })),
        })
      : jsonResponse({
          items: [
            {
              id: 'kyoto',
              snippet: { title: 'A walk in KYOTO' },
              status: { embeddable: true },
              contentDetails: { duration: 'PT1H' },
            },
            {
              id: 'tokyo',
              snippet: { title: 'Tokyo streets' },
              status: { embeddable: true },
              contentDetails: { duration: 'PT1H' },
            },
            { id: 'unknown', status: { embeddable: true }, contentDetails: { duration: 'PT1H' } },
          ],
        })
  const options = { apiKey: 'key', fetchFn, storage: mapStorage(memory) }
  expect(await fetchChannelCatalog(channel, options)).toEqual([
    { videoId: 'kyoto', durationSeconds: 3600, title: 'A walk in KYOTO' },
  ])
  expect(await fetchChannelCatalog({ ...channel, titleTerms: ['tokyo'] }, options)).toEqual([
    { videoId: 'tokyo', durationSeconds: 3600, title: 'Tokyo streets' },
  ])
})

it.each(['unchanged', 'empty', 'error'])(
  'backs off an exhausted playlist after an %s response, then permits recovery',
  async (response) => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000)
    try {
      const channel: Channel = { ...nature, kind: 'playlist', playlistId: 'PLfailed' }
      const memory = new Map([
        [
          'pp-catalog-1-playlist-PLfailed',
          JSON.stringify({
            items: [{ videoId: 'failed', durationSeconds: 600 }],
            fetchedAt: Date.now(),
          }),
        ],
      ])
      let videoId = 'failed'
      const fetchFn = vi.fn((input: RequestInfo | URL) => {
        if (videoId === 'failed' && response === 'error')
          return Promise.reject(new Error('offline'))
        if (videoId === 'failed' && response === 'empty') return jsonResponse({ items: [] })
        return String(input).includes('playlistItems')
          ? jsonResponse({ items: [{ contentDetails: { videoId } }] })
          : jsonResponse({
              items: [
                {
                  id: videoId,
                  status: { embeddable: true },
                  contentDetails: { duration: 'PT10M' },
                },
              ],
            })
      })
      const options = {
        apiKey: 'key',
        fetchFn,
        storage: mapStorage(memory),
        excludeIds: ['failed'],
      }
      expect(await fetchChannelCatalog(channel, options)).toEqual([])
      now.mockReturnValue(1_800_000_008_000)
      expect(await fetchChannelCatalog(channel, options)).toEqual([])
      expect(fetchFn).toHaveBeenCalledTimes(response === 'unchanged' ? 2 : 1)
      now.mockReturnValue(1_800_000_301_000)
      videoId = 'recovered'
      expect(await fetchChannelCatalog(channel, options)).toEqual([
        { videoId: 'recovered', durationSeconds: 600 },
      ])
    } finally {
      now.mockRestore()
    }
  },
)

const curated: Channel = {
  number: 200,
  name: 'Cricket legends',
  kind: 'curated',
  tags: ['Cricket'],
  curatedCatalog: [
    { videoId: 'sachin', title: 'Sachin classic', durationSeconds: 600 },
    { videoId: 'dhoni', title: 'Dhoni finish', durationSeconds: 500 },
  ],
}

it('can start a curated station without an API key', async () => {
  expect(await fetchChannelCatalog(curated, { apiKey: '', fetchFn: vi.fn() })).toEqual(
    curated.curatedCatalog,
  )
})

it('validates curated IDs directly without letting publisher uploads change the programming', async () => {
  const fetchFn = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(String(input))
    expect(url.pathname).toBe('/youtube/v3/videos')
    expect(url.searchParams.get('id')).toBe('sachin,dhoni')
    return jsonResponse({
      items: [
        {
          id: 'sachin',
          snippet: { title: 'Sachin classic' },
          status: { embeddable: true },
          contentDetails: { duration: 'PT10M' },
        },
        { id: 'dhoni', status: { embeddable: false }, contentDetails: { duration: 'PT8M20S' } },
      ],
    })
  })
  expect(await fetchChannelCatalog(curated, { apiKey: 'key', fetchFn })).toEqual([
    curated.curatedCatalog![0],
  ])
})

it('keeps curated programming available during API outages while respecting failed video exclusions', async () => {
  expect(
    await fetchChannelCatalog(curated, {
      apiKey: 'key',
      fetchFn: async () => {
        throw new Error('offline')
      },
      excludeIds: ['sachin'],
    }),
  ).toEqual([curated.curatedCatalog![1]])
})

it('does not revive curated videos that YouTube has confirmed are unavailable', async () => {
  const storage = mapStorage(new Map())
  const fetchFn = vi.fn(() => jsonResponse({ items: [] }))
  expect(await fetchChannelCatalog(curated, { apiKey: 'key', fetchFn, storage })).toEqual([])
  expect(await fetchChannelCatalog(curated, { apiKey: 'key', fetchFn, storage })).toEqual([])
  expect(fetchFn).toHaveBeenCalledTimes(1)
})

it('backs off after an API outage even when an exhausted curated station has never been cached', async () => {
  const storage = mapStorage(new Map())
  const fetchFn = vi.fn(async () => {
    throw new Error('offline')
  })
  const options = { apiKey: 'key', storage, fetchFn, excludeIds: ['sachin', 'dhoni'] }
  expect(await fetchChannelCatalog(curated, options)).toEqual([])
  expect(await fetchChannelCatalog(curated, options)).toEqual([])
  expect(fetchFn).toHaveBeenCalledTimes(1)
})
