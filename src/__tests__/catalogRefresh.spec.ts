// Keep these playlist/retry fixtures independent of the curated channel lineup.
vi.mock('../data/curatedPrograms', () => ({ CURATED_PROGRAMS: {} }))

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useTvStore } from '../stores/tv'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test')
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('refreshes catalogs during a multi-day viewing session', async () => {
  let videoId = 'monday'
  vi.stubGlobal('fetch', async (input: string) => ({
    ok: true,
    json: async () =>
      input.includes('playlistItems')
        ? { items: [{ contentDetails: { videoId } }] }
        : {
            items: [
              { id: videoId, status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
            ],
          },
  }))
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('monday')
  videoId = 'tuesday'
  vi.setSystemTime(Date.now() + 25 * 3600_000)
  tv.onPlayerEnded()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('tuesday')
  tv.powerOff()
})

it('clears the previous channel picture while a new channel is loading', async () => {
  vi.stubGlobal('fetch', async (input: string) => ({
    ok: true,
    json: async () =>
      input.includes('playlistItems')
        ? { items: [{ contentDetails: { videoId: 'bollywood' } }] }
        : {
            items: [
              {
                id: 'bollywood',
                status: { embeddable: true },
                contentDetails: { duration: 'PT10M' },
              },
            ],
          },
  }))
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('bollywood')
  vi.stubGlobal('fetch', () => new Promise(() => {}))
  tv.setChannel(2)
  expect(tv.currentSlot).toBeNull()
  tv.powerOff()
})

it('does not extend a nearly expired persisted catalog by another day', async () => {
  const { channelByNumber } = await import('../data/channels')
  localStorage.setItem(
    `pp-catalog-1-playlist-${channelByNumber(1)!.playlistId}`,
    JSON.stringify({
      items: [{ videoId: 'old', durationSeconds: 600 }],
      fetchedAt: Date.now() - 23 * 3600_000,
    }),
  )
  vi.stubGlobal('fetch', async (input: string) => ({
    ok: true,
    json: async () =>
      input.includes('playlistItems')
        ? { items: [{ contentDetails: { videoId: 'fresh' } }] }
        : {
            items: [
              { id: 'fresh', status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
            ],
          },
  }))
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('old')
  vi.setSystemTime(Date.now() + 2 * 3600_000)
  tv.onPlayerEnded()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('fresh')
  tv.powerOff()
})
