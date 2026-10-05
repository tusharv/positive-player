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

it.each(CHANNELS.slice(0, 10))(
  '$name starts immediately without a key or cached catalog',
  async (channel) => {
    const fetchFn = vi.fn()
    vi.stubGlobal('fetch', fetchFn)
    localStorage.setItem('pp-channel', String(channel.number))
    const tv = useTvStore()
    tv.powerOn()
    expect(channel.curatedCatalog?.some((item) => item.videoId === tv.currentSlot?.videoId)).toBe(
      true,
    )
    await flushPromises()
    expect(tv.interruption).toBe('none')
    expect(fetchFn).not.toHaveBeenCalled()
    expect(channel.curatedCatalog!.length).toBeGreaterThanOrEqual(6)
    expect(new Set(channel.curatedCatalog!.map((item) => item.videoId)).size).toBe(
      channel.curatedCatalog!.length,
    )
    tv.powerOff()
  },
)

it('programmes innings and performances from all four requested cricket legends', () => {
  const titles = CHANNELS[1]!.curatedCatalog!.map((item) => item.title).join(' ')
  for (const player of ['Sachin', 'Dravid', 'Dhoni', 'Gavaskar', 'Lara', 'Warne']) {
    expect(titles).toContain(player)
  }
  expect(titles).not.toMatch(/press conference|interview|trailer/i)
})

it('moves to another curated programme when a video fails', async () => {
  const tv = useTvStore()
  tv.powerOn()
  const failed = tv.currentSlot!.videoId
  tv.onPlayerError(150, failed)
  await vi.advanceTimersByTimeAsync(2000)
  expect(tv.currentSlot?.videoId).not.toBe(failed)
  expect(
    CHANNELS[0]!.curatedCatalog!.some((item) => item.videoId === tv.currentSlot?.videoId),
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
  const updated = { ...original, curatedCatalog: [{ videoId: 'new', durationSeconds: 600 }] }
  expect(readChannelCatalog(updated, localStorage)).toEqual([
    { videoId: 'new', durationSeconds: 600 },
  ])
})

it('keeps every curated programme within its channel topic filter', () => {
  for (const channel of CHANNELS.slice(0, 10)) {
    for (const item of channel.curatedCatalog ?? []) {
      if (channel.titleTerms?.length) {
        expect(
          channel.titleTerms.some((term) => item.title?.toLowerCase().includes(term.toLowerCase())),
          item.title,
        ).toBe(true)
      }
    }
  }
})
