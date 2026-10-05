import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useTvStore } from '../stores/tv'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test')
  vi.stubGlobal('dataLayer', [])
  vi.stubGlobal('clarity', vi.fn())
  vi.stubGlobal('fetch', async (input: string) => ({
    ok: true,
    json: async () =>
      input.includes('playlistItems')
        ? { items: [{ contentDetails: { videoId: 'video' } }] }
        : {
            items: [
              { id: 'video', status: { embeddable: true }, contentDetails: { duration: 'PT10M' } },
            ],
          },
  }))
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
const events = (name: string) => window.dataLayer!.filter((e) => e.event === name)

it('counts confirmed playback once per tune, not on catalog load or buffering', async () => {
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(events('channel_select')).toHaveLength(1)
  expect(events('channel_play')).toHaveLength(0)
  tv.onPlayerPlaying('video')
  tv.onPlayerPlaying('video')
  expect(events('channel_play')).toEqual([
    expect.objectContaining({ channel_name: 'Bollywood', channel_number: 1 }),
  ])
  tv.onPlayerEnded()
  await flushPromises()
  tv.onPlayerPlaying('video')
  expect(events('channel_play')).toHaveLength(1)
  tv.setChannel(2)
  await flushPromises()
  tv.onPlayerPlaying('video')
  expect(events('channel_play')).toHaveLength(2)
  expect(events('channel_play')[1]).toMatchObject({ channel_name: 'Cricket' })
  expect(window.clarity).toHaveBeenCalledWith('event', 'channel_play_002')
  tv.powerOff()
  tv.onPlayerPlaying('video')
  expect(events('channel_play')).toHaveLength(2)
})

it('attributes failures and deduplicates retries without leaking error details', async () => {
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404, json: async () => ({}) }))
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  await vi.advanceTimersByTimeAsync(8100)
  expect(events('channel_error')).toEqual([
    expect.objectContaining({
      channel_name: 'Bollywood',
      failure_reason: 'catalog_empty',
      failure_stage: 'catalog',
    }),
  ])
  tv.powerOff()
})

it('records player error codes and ignores stale video callbacks', async () => {
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  tv.onPlayerPlaying('old-video')
  expect(events('channel_play')).toHaveLength(0)
  tv.onPlayerError(101, 'video')
  tv.onPlayerError(101, 'video')
  expect(events('channel_error')).toHaveLength(1)
  expect(events('channel_error')[0]).toMatchObject({
    failure_reason: 'embed_not_allowed',
    error_code: '101',
  })
  expect(window.clarity).toHaveBeenCalledWith('event', 'channel_error_001')
  tv.powerOff()
})

it('keeps the TV working if analytics providers throw', async () => {
  vi.stubGlobal('dataLayer', {
    push: () => {
      throw new Error('blocked')
    },
  })
  vi.stubGlobal('clarity', () => {
    throw new Error('blocked')
  })
  const tv = useTvStore()
  expect(() => tv.powerOn()).not.toThrow()
  await flushPromises()
  expect(() => tv.onPlayerPlaying('video')).not.toThrow()
  expect(tv.currentSlot?.videoId).toBe('video')
  tv.powerOff()
})

it('queues Clarity events before its tag loads and clears old GA error fields', async () => {
  vi.stubGlobal('clarity', undefined)
  const { trackChannel } = await import('../lib/channelAnalytics')
  const { channelByNumber } = await import('../data/channels')
  trackChannel('channel_error', channelByNumber(1)!, {
    failure_reason: 'video_unavailable',
    error_code: '100',
  })
  trackChannel('channel_play', channelByNumber(2)!)
  expect(window.clarity!.q).toContainEqual(['event', 'channel_error_001'])
  expect(events('channel_play')[0]).toMatchObject({
    failure_reason: '',
    error_code: '',
    channel_name: 'Cricket',
  })
})

it('does not attribute a previous player error to its replacement programme', async () => {
  const { mount } = await import('@vue/test-utils')
  const { getActivePinia } = await import('pinia')
  const { default: PlayerPage } = await import('../views/PlayerPage.vue')
  const callbacks: Array<Record<string, (event: { data: number }) => void>> = []
  vi.stubGlobal('YT', {
    Player: class {
      constructor(
        _host: HTMLElement,
        options: { events: Record<string, (event: { data: number }) => void> },
      ) {
        callbacks.push(options.events)
      }
      loadVideoById() {}
      getVideoUrl() {
        return 'https://www.youtube.com/watch?v=video'
      }
      destroy() {}
      setVolume() {}
      mute() {}
      unMute() {}
    },
    PlayerState: { PLAYING: 1, ENDED: 0 },
  })
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  const wrapper = mount(PlayerPage, {
    global: { plugins: [getActivePinia()!], stubs: { RemotePairing: true } },
  })
  await flushPromises()
  const previous = callbacks[0]!
  tv.currentSlot = { videoId: 'replacement', startSeconds: 0 }
  await flushPromises()
  previous.onError!({ data: 100 })
  expect(events('channel_error')).toHaveLength(0)
  expect(tv.currentSlot?.videoId).toBe('replacement')
  wrapper.unmount()
  tv.powerOff()
})
