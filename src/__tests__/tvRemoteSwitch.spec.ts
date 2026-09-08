import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useTvStore } from '../stores/tv'
import { CatalogFetchError } from '../lib/youtubeData'

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
  localStorage.clear()
  sessionStorage.clear()
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key')
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('does not keep retrying after YouTube search quota is exhausted', async () => {
  const fetchFn = vi.fn().mockResolvedValue({
    ok: false,
    status: 429,
    json: () =>
      Promise.resolve({
        error: { code: 429, status: 'RESOURCE_EXHAUSTED' },
      }),
  })
  vi.stubGlobal('fetch', fetchFn)
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(tv.interruption).toBe('hold')
  await vi.advanceTimersByTimeAsync(24000)
  expect(fetchFn).toHaveBeenCalledTimes(1)
})

it('cancels an old channel retry when a remote channel change is loading', async () => {
  const fetchFn = vi
    .fn()
    .mockRejectedValueOnce(new CatalogFetchError('offline'))
    .mockImplementation(() => new Promise(() => {}))
  vi.stubGlobal('fetch', fetchFn)
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  tv.channelStep(1)
  await vi.advanceTimersByTimeAsync(8100)
  expect(fetchFn).toHaveBeenCalledTimes(2)
  expect(tv.channelNumber).toBe(2)
})

it('does not skip a newly selected channel because the previous video failed', async () => {
  sessionStorage.setItem(
    'pp-catalog-1',
    JSON.stringify([{ videoId: 'first', durationSeconds: 100 }]),
  )
  sessionStorage.setItem(
    'pp-catalog-2',
    JSON.stringify([{ videoId: 'second', durationSeconds: 100 }]),
  )
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  tv.onPlayerError()
  tv.channelStep(1)
  await flushPromises()
  await vi.advanceTimersByTimeAsync(2100)
  expect(tv.currentSlot?.videoId).toBe('second')
  expect(tv.interruption).toBe('none')
})
