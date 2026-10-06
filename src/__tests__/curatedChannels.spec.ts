import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { CHANNELS } from '../data/channels'
import { channelCatalogKey, readChannelCatalog } from '../lib/youtubeData'
import { useTvStore } from '../stores/tv'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_YOUTUBE_API_KEY', '')
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it.each(CHANNELS)(
  '$name starts from its lazy bundle without a key or cached catalog',
  async (channel) => {
    const fetchFn = vi.fn()
    vi.stubGlobal('fetch', fetchFn)
    localStorage.setItem('pp-channel', String(channel.number))
    const tv = useTvStore()
    tv.powerOn()
    await vi.dynamicImportSettled()
    await flushPromises()
    const catalog = await channel.loadCuratedCatalog!()
    expect(catalog.some((item) => item.videoId === tv.currentSlot?.videoId)).toBe(true)
    expect(tv.interruption).toBe('none')
    expect(fetchFn).not.toHaveBeenCalled()
    expect(catalog.length).toBeGreaterThanOrEqual(3)
    expect(new Set(catalog.map((item) => item.videoId)).size).toBe(catalog.length)
    tv.powerOff()
  },
)

it('programmes innings and performances from all four requested cricket legends', async () => {
  const titles = (await CHANNELS[1]!.loadCuratedCatalog!()).map((item) => item.title).join(' ')
  for (const player of ['Sachin', 'Dravid', 'Dhoni', 'Gavaskar', 'Lara', 'Warne']) {
    expect(titles).toContain(player)
  }
  expect(titles).not.toMatch(/press conference|interview|trailer/i)
})

it('moves to another curated programme when a video fails', async () => {
  const tv = useTvStore()
  tv.powerOn()
  await vi.dynamicImportSettled()
  await flushPromises()
  const failed = tv.currentSlot!.videoId
  tv.onPlayerError(150, failed)
  await vi.advanceTimersByTimeAsync(2000)
  expect(tv.currentSlot?.videoId).not.toBe(failed)
  expect(
    (await CHANNELS[0]!.loadCuratedCatalog!()).some(
      (item) => item.videoId === tv.currentSlot?.videoId,
    ),
  ).toBe(true)
  expect(tv.channelNumber).toBe(1)
  tv.powerOff()
})

it('does not carry an old curated schedule into a changed selection', () => {
  const original = CHANNELS[0]!
  localStorage.setItem(
    channelCatalogKey(original),
    JSON.stringify({ items: [{ videoId: 'old', durationSeconds: 600 }], fetchedAt: Date.now() }),
  )
  const updated = {
    ...original,
    curatedVersion: 'changed',
    curatedCatalog: [{ videoId: 'new', durationSeconds: 600 }],
  }
  expect(readChannelCatalog(updated, localStorage)).toEqual([
    { videoId: 'new', durationSeconds: 600 },
  ])
})

it('keeps every curated programme within its channel topic filter', async () => {
  for (const channel of CHANNELS) {
    for (const item of await channel.loadCuratedCatalog!()) {
      if (channel.titleTerms?.length) {
        expect(
          channel.titleTerms.some((term) => item.title?.toLowerCase().includes(term.toLowerCase())),
          item.title,
        ).toBe(true)
      }
    }
  }
})
