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

it('powers off without retrying or committing pending channel digits', async () => {
  const fetchFn = vi.fn().mockRejectedValue(new CatalogFetchError('offline'))
  vi.stubGlobal('fetch', fetchFn)
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  tv.typeDigit('2')
  tv.powerOff()
  await vi.advanceTimersByTimeAsync(24000)
  tv.tickDigits()
  expect(tv.poweredOn).toBe(false)
  expect(tv.currentSlot).toBeNull()
  expect(tv.pendingDigits).toBe('')
  expect(tv.channelNumber).toBe(1)
  expect(fetchFn).toHaveBeenCalledTimes(1)
})

it('hides channel and volume readouts independently after five seconds', async () => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
  const tv = useTvStore()
  tv.powerOn()
  expect(tv.hudVisible).toBe(true)
  expect(tv.volumeVisible).toBe(false)
  await vi.advanceTimersByTimeAsync(5000)
  expect(tv.hudVisible).toBe(false)
  tv.volumeStep(5)
  expect(tv.volumeVisible).toBe(true)
  expect(tv.hudVisible).toBe(false)
  await vi.advanceTimersByTimeAsync(4000)
  tv.muteToggle()
  await vi.advanceTimersByTimeAsync(1000)
  expect(tv.volumeVisible).toBe(true)
  await vi.advanceTimersByTimeAsync(4000)
  expect(tv.volumeVisible).toBe(false)
  tv.channelStep(1)
  expect(tv.hudVisible).toBe(true)
  expect(tv.volumeVisible).toBe(false)
})
