import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { CHANNEL_COUNT } from '../data/channels'
import { useTvStore } from '../stores/tv'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('restores the latest selected channel in a fresh TV instance and plays it on power-on', async () => {
  const tv = useTvStore()
  tv.setChannel(10)
  tv.channelStep(1)
  setActivePinia(createPinia())
  const restored = useTvStore()
  expect(restored.channelNumber).toBe(11)
  sessionStorage.setItem('pp-catalog-11', JSON.stringify([{ videoId: 'last-channel-video', durationSeconds: 100 }]))
  restored.powerOn()
  await flushPromises()
  expect(restored.currentSlot?.videoId).toBe('last-channel-video')
})

it.each([null, 'broken', '0', '-1', '2.5', String(CHANNEL_COUNT + 1)])('falls back to the first channel for saved value %s', saved => {
  if (saved !== null) localStorage.setItem('pp-channel', saved)
  expect(useTvStore().channelNumber).toBe(1)
})

it('ignores invalid selections without overwriting the remembered channel', () => {
  const tv = useTvStore()
  tv.setChannel(11)
  for (const value of [0, CHANNEL_COUNT + 1, 1.5, NaN]) tv.setChannel(value)
  setActivePinia(createPinia())
  expect(useTvStore().channelNumber).toBe(11)
})

it('keeps channel controls working when browser storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
  const tv = useTvStore()
  expect(tv.channelNumber).toBe(1)
  expect(() => tv.setChannel(11)).not.toThrow()
  expect(tv.channelNumber).toBe(11)
})
