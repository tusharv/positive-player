import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { channelByNumber } from '../data/channels'
import { channelCatalogKey } from '../lib/youtubeData'
import { useTvStore } from '../stores/tv'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key')
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => {})),
  )
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function cacheChannel(
  number: number,
  items: Array<{ videoId: string; title?: string; durationSeconds: number }>,
) {
  sessionStorage.setItem(
    channelCatalogKey(channelByNumber(number)!),
    JSON.stringify({ items, fetchedAt: Date.now() }),
  )
}

it('shows a clipped programme title and leaves the label empty when a video has none', async () => {
  cacheChannel(1, [{ videoId: 'named', title: `  ${'Raga'.repeat(30)}  `, durationSeconds: 5000 }])
  const titled = useTvStore()
  titled.powerOn()
  await flushPromises()
  expect(titled.programmeTitle.endsWith('…')).toBe(true)
  expect(titled.programmeTitle.length).toBeLessThanOrEqual(80)
  expect(titled.programmeTitle).not.toContain(titled.currentSlot?.videoId ?? 'named')
  titled.powerOff()

  setActivePinia(createPinia())
  cacheChannel(1, [{ videoId: 'plain', durationSeconds: 5000 }])
  const untitled = useTvStore()
  untitled.powerOn()
  await flushPromises()
  expect(untitled.currentSlot?.videoId).toBe('plain')
  expect(untitled.programmeTitle).toBe('')
})

it('announces the next programme on the same channel', async () => {
  cacheChannel(1, [
    { videoId: 'one', title: 'First programme', durationSeconds: 100 },
    { videoId: 'two', title: 'Second programme', durationSeconds: 100 },
  ])
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  const first = tv.programmeTitle
  await vi.advanceTimersByTimeAsync(5000)
  expect(tv.hudVisible).toBe(false)
  tv.skipCurrent()
  expect(tv.programmeTitle).not.toBe(first)
  expect(['First programme', 'Second programme']).toContain(tv.programmeTitle)
  expect(tv.hudVisible).toBe(true)
})

it('toggles the previous channel and ignores a missing one', () => {
  const tv = useTvStore()
  expect(tv.canRecall).toBe(false)
  tv.recallChannel()
  expect(tv.channelNumber).toBe(1)
  tv.setChannel(4)
  expect(localStorage.getItem('pp-previous-channel')).toBe('1')
  expect(tv.canRecall).toBe(true)
  tv.recallChannel()
  expect(tv.channelNumber).toBe(1)
  tv.recallChannel()
  expect(tv.channelNumber).toBe(4)
  setActivePinia(createPinia())
  expect(useTvStore().canRecall).toBe(true)
  localStorage.setItem('pp-previous-channel', '999')
  setActivePinia(createPinia())
  const missing = useTvStore()
  expect(missing.canRecall).toBe(false)
  missing.recallChannel()
  expect(missing.channelNumber).toBe(4)
})

it('turns the set off when sleep ends and clears the timer on a manual power-off', async () => {
  const tv = useTvStore()
  tv.powerOn()
  tv.cycleSleep()
  expect(tv.sleepMinutes).toBe(30)
  expect(tv.sleepNotice).toBe('SLEEP 30')
  expect(tv.sleepUntil).toBeGreaterThan(Date.now())
  tv.cycleSleep()
  tv.cycleSleep()
  expect(tv.sleepMinutes).toBe(90)
  tv.cycleSleep()
  expect(tv.sleepMinutes).toBe(0)
  expect(tv.sleepNotice).toBe('SLEEP OFF')
  expect(tv.sleepUntil).toBeNull()
  tv.cycleSleep()
  tv.powerOff()
  expect(tv.sleepMinutes).toBe(0)
  expect(tv.sleepUntil).toBeNull()
  tv.powerOn()
  await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
  expect(tv.poweredOn).toBe(true)
  tv.cycleSleep()
  await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
  expect(tv.poweredOn).toBe(false)
  expect(tv.sleepMinutes).toBe(0)
  expect(tv.sleepUntil).toBeNull()
})
