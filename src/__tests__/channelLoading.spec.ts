// Keep these playlist/retry fixtures independent of the curated channel lineup.
vi.mock('../data/curatedPrograms', () => ({ CURATED_PROGRAMS: {} }))

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia, getActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { useTvStore } from '../stores/tv'
import { channelByNumber } from '../data/channels'
import PlayerPage from '../views/PlayerPage.vue'
import YoutubeStage from '../components/YoutubeStage.vue'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test')
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
function cache(channel: number, videoId: string, age = 0) {
  localStorage.setItem(
    `pp-catalog-${channel}-playlist-${channelByNumber(channel)!.playlistId}`,
    JSON.stringify({
      items: [{ videoId, durationSeconds: 600 }],
      fetchedAt: Date.now() - age,
    }),
  )
}

it('tunes directly from cache without a null slot or waiting for a stale refresh', async () => {
  cache(1, 'first')
  cache(2, 'second', 25 * 3600_000)
  vi.stubGlobal('fetch', () => new Promise(() => {}))
  const tv = useTvStore()
  tv.powerOn()
  expect(tv.currentSlot?.videoId).toBe('first')
  tv.setChannel(2)
  expect(tv.currentSlot?.videoId).toBe('second')
  tv.powerOff()
})

it('starts on the first usable playlist page while the rest of the catalog loads', async () => {
  let finishPage!: (value: Response) => void
  vi.stubGlobal('fetch', async (input: string) => {
    const url = new URL(input)
    if (url.searchParams.has('pageToken'))
      return new Promise<Response>((resolve) => {
        finishPage = resolve
      })
    return {
      ok: true,
      json: async () =>
        url.pathname.endsWith('/playlistItems')
          ? { items: [{ contentDetails: { videoId: 'first-page' } }], nextPageToken: 'next' }
          : {
              items: [
                {
                  id: 'first-page',
                  status: { embeddable: true },
                  contentDetails: { duration: 'PT10M' },
                },
              ],
            },
    }
  })
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  expect(tv.currentSlot?.videoId).toBe('first-page')
  const revision = tv.playbackRevision
  finishPage({ ok: true, json: async () => ({ items: [] }) } as Response)
  await flushPromises()
  expect(tv.playbackRevision).toBe(revision)
  tv.powerOff()
})

it('keeps a tuning screen until actual playback, not just the zap timer or catalog completion', async () => {
  cache(1, 'first')
  cache(2, 'second')
  const tv = useTvStore()
  tv.powerOn()
  const wrapper = mount(PlayerPage, {
    global: {
      plugins: [getActivePinia()!],
      stubs: { YoutubeStage: true, RemotePairing: true, ChannelZap: true },
    },
  })
  try {
    await flushPromises()
    expect(wrapper.find('[data-testid="channel-tuning"]').exists()).toBe(true)
    expect(wrapper.find('channel-zap-stub').exists()).toBe(true)
    wrapper.findComponent(YoutubeStage).vm.$emit('playing', 'first')
    await flushPromises()
    expect(wrapper.find('[data-testid="channel-tuning"]').exists()).toBe(false)
    expect(wrapper.find('channel-zap-stub').exists()).toBe(false)
    tv.setChannel(2)
    await vi.advanceTimersByTimeAsync(4500)
    expect(wrapper.find('[data-testid="channel-tuning"]').exists()).toBe(true)
    expect(wrapper.find('channel-zap-stub').exists()).toBe(true)
    wrapper.findComponent(YoutubeStage).vm.$emit('playing', 'first')
    await flushPromises()
    expect(wrapper.find('[data-testid="channel-tuning"]').exists()).toBe(true)
    expect(wrapper.find('channel-zap-stub').exists()).toBe(true)
    wrapper.findComponent(YoutubeStage).vm.$emit('playing', 'second')
    await flushPromises()
    expect(wrapper.find('[data-testid="channel-tuning"]').exists()).toBe(false)
    expect(wrapper.find('channel-zap-stub').exists()).toBe(false)
    tv.powerOff()
  } finally {
    wrapper.unmount()
  }
})

it('leaves tuning with an interruption message if the catalog or video never starts', async () => {
  vi.stubGlobal('fetch', () => new Promise(() => {}))
  const tv = useTvStore()
  tv.powerOn()
  await vi.advanceTimersByTimeAsync(20000)
  expect(tv.interruption).toBe('hold')
  tv.powerOff()
  cache(1, 'first')
  tv.powerOn()
  await flushPromises()
  await vi.advanceTimersByTimeAsync(20000)
  expect(tv.interruption).toBe('hold')
  tv.powerOff()
})

it('skips a football video that never starts and plays another from the same channel', async () => {
  const football = channelByNumber(11)!
  localStorage.setItem('pp-channel', '11')
  localStorage.setItem(
    `pp-catalog-11-playlist-${football.playlistId}`,
    JSON.stringify({
      items: [
        { videoId: 'match-a', durationSeconds: 600 },
        { videoId: 'match-b', durationSeconds: 600 },
      ],
      fetchedAt: Date.now(),
    }),
  )
  const tv = useTvStore()
  tv.powerOn()
  await flushPromises()
  const stalled = tv.currentSlot!.videoId
  await vi.advanceTimersByTimeAsync(20000)
  expect(tv.currentSlot?.videoId).toBe(stalled === 'match-a' ? 'match-b' : 'match-a')
  expect(tv.channelNumber).toBe(11)
  tv.onPlayerPlaying(tv.currentSlot!.videoId)
  expect(tv.waitingForPlayback).toBe(false)
  expect(tv.interruption).toBe('none')
  tv.powerOff()
})
