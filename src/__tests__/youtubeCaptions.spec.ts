import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import YoutubeStage from '../components/YoutubeStage.vue'

afterEach(() => vi.unstubAllGlobals())

async function setup(withCaptionApi = true) {
  let options: Record<string, unknown> = {}
  const player = {
    loadVideoById: vi.fn(),
    getVideoUrl: () => `https://www.youtube.com/watch?v=${wrapper.props('videoId')}`,
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
    ...(withCaptionApi ? { unloadModule: vi.fn() } : {}),
  }
  vi.stubGlobal('YT', {
    Player: class {
      constructor(_host: HTMLElement, config: Record<string, unknown>) {
        options = config
        return player
      }
    },
    PlayerState: { ENDED: 0, PLAYING: 1 },
  })
  const onPlaying = vi.fn()
  const onError = vi.fn()
  const wrapper = mount(YoutubeStage, {
    props: {
      videoId: 'first-video',
      startSeconds: 0,
      volume: 50,
      muted: false,
      onPlaying,
      onError,
    },
  })
  await flushPromises()
  const events = options.events as Record<string, (event?: { data: number }) => void>
  return { wrapper, player, events, onPlaying, onError }
}

describe('YouTube caption suppression', () => {
  it('disables captions again when playback starts after the caption module loads', async () => {
    const { wrapper, player, events } = await setup()
    try {
      events.onReady!()
      events.onApiChange!()
      player.unloadModule!.mockClear()
      events.onStateChange!({ data: 1 })
      expect(player.unloadModule).toHaveBeenCalledWith('captions')
      player.unloadModule!.mockClear()
      await wrapper.setProps({ videoId: 'next-video' })
      events.onStateChange!({ data: 3 })
      events.onStateChange!({ data: 1 })
      expect(player.unloadModule).toHaveBeenCalledWith('captions')
    } finally {
      wrapper.unmount()
    }
  })

  it('disables captions on readiness and when caption modules load for subsequent videos', async () => {
    const { wrapper, player, events } = await setup()
    try {
      events.onReady!()
      expect(player.unloadModule).toHaveBeenCalledWith('captions')
      player.unloadModule!.mockClear()
      await wrapper.setProps({ videoId: 'next-video' })
      events.onApiChange!()
      expect(player.unloadModule).toHaveBeenCalledWith('captions')
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps playback callbacks working if YouTube does not expose caption suppression', async () => {
    const { wrapper, events } = await setup(false)
    try {
      expect(() => events.onReady!()).not.toThrow()
      expect(() => events.onApiChange!()).not.toThrow()
      events.onStateChange!({ data: 0 })
      expect(wrapper.emitted('ended')).toHaveLength(1)
      expect(wrapper.emitted('script-error')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })
})

it('reloads a repeated single-video broadcast even when its video and start time are unchanged', async () => {
  const { wrapper, player, events } = await setup()
  try {
    events.onReady!()
    await wrapper.setProps({ playbackRevision: 1 })
    expect(player.loadVideoById).toHaveBeenCalledWith({ videoId: 'first-video', startSeconds: 0 })
  } finally {
    wrapper.unmount()
  }
})

it('reports real playback and YouTube error codes, ignoring a destroyed player', async () => {
  const { wrapper, events, onPlaying, onError } = await setup()
  events.onStateChange!({ data: 3 })
  expect(wrapper.emitted('playing')).toBeUndefined()
  events.onStateChange!({ data: 1 })
  expect(wrapper.emitted('playing')).toEqual([['first-video']])
  events.onError!({ data: 101 })
  expect(wrapper.emitted('error')).toEqual([[101, 'first-video']])
  wrapper.unmount()
  events.onStateChange!({ data: 1 })
  events.onError!({ data: 150 })
  expect(onPlaying).toHaveBeenCalledTimes(1)
  expect(onError).toHaveBeenCalledTimes(1)
})
