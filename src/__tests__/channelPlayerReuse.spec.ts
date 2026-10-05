import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PlayerPage from '../views/PlayerPage.vue'
import YoutubeStage from '../components/YoutubeStage.vue'
import { useTvStore } from '../stores/tv'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function youtube() {
  let events: Record<string, (event: { data: number }) => void> = {}
  let currentVideo = 'first-video'
  const player = {
    loadVideoById: vi.fn(),
    stopVideo: vi.fn(),
    getVideoUrl: () => `https://www.youtube.com/watch?v=${currentVideo}`,
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
  }
  const constructed = vi.fn()
  vi.stubGlobal('YT', {
    Player: class {
      constructor(_host: HTMLElement, config: { events: typeof events }) {
        events = config.events
        constructed()
        return player
      }
    },
    PlayerState: { PLAYING: 1, ENDED: 0 },
  })
  return {
    player,
    constructed,
    emit: (name: string, data = 0) => events[name]!({ data }),
    video: (id: string) => {
      currentVideo = id
    },
  }
}

it('keeps one player through the catalog gap and subsequent channel switches', async () => {
  const yt = youtube()
  const pinia = createPinia()
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  tv.currentSlot = { videoId: 'first-video', startSeconds: 12 }
  const wrapper = mount(PlayerPage, {
    global: { plugins: [pinia], stubs: { RemotePairing: true } },
  })
  try {
    await flushPromises()
    yt.emit('onReady')
    tv.currentSlot = null
    tv.channelNumber = 2
    await flushPromises()
    expect(yt.player.destroy).not.toHaveBeenCalled()
    expect(yt.player.stopVideo).toHaveBeenCalledOnce()
    tv.currentSlot = { videoId: 'second-video', startSeconds: 25 }
    tv.playbackRevision++
    await flushPromises()
    expect(yt.constructed).toHaveBeenCalledOnce()
    expect(yt.player.loadVideoById).toHaveBeenLastCalledWith({
      videoId: 'second-video',
      startSeconds: 25,
    })
    tv.currentSlot = { videoId: 'third-video', startSeconds: 50 }
    await flushPromises()
    expect(yt.constructed).toHaveBeenCalledOnce()
    expect(yt.player.loadVideoById).toHaveBeenLastCalledWith({
      videoId: 'third-video',
      startSeconds: 50,
    })
    tv.powerOff()
    await flushPromises()
    expect(yt.player.destroy).toHaveBeenCalledOnce()
  } finally {
    wrapper.unmount()
  }
})

it('ignores old video callbacks after loading a replacement into the same player', async () => {
  const yt = youtube()
  const wrapper = mount(YoutubeStage, {
    props: { videoId: 'first-video', startSeconds: 0, volume: 80, muted: false },
  })
  try {
    await flushPromises()
    yt.emit('onReady')
    await wrapper.setProps({ videoId: 'second-video' })
    yt.emit('onStateChange', 1)
    yt.emit('onStateChange', 0)
    yt.emit('onError', 100)
    expect(wrapper.emitted('playing')).toBeUndefined()
    expect(wrapper.emitted('ended')).toBeUndefined()
    expect(wrapper.emitted('error')).toBeUndefined()
    yt.video('second-video')
    yt.emit('onStateChange', 1)
    yt.emit('onError', 101)
    yt.emit('onStateChange', 0)
    expect(wrapper.emitted('playing')).toEqual([['second-video']])
    expect(wrapper.emitted('error')).toEqual([[101, 'second-video']])
    expect(wrapper.emitted('ended')).toHaveLength(1)
  } finally {
    wrapper.unmount()
  }
})

it('queues only the latest channel when switching before the player is ready', async () => {
  const yt = youtube()
  const wrapper = mount(YoutubeStage, {
    props: { videoId: 'first-video', startSeconds: 0, volume: 80, muted: false },
  })
  try {
    await flushPromises()
    await wrapper.setProps({ videoId: 'second-video', startSeconds: 20 })
    await wrapper.setProps({ videoId: 'third-video', startSeconds: 40 })
    expect(yt.player.loadVideoById).not.toHaveBeenCalled()
    yt.emit('onReady')
    expect(yt.player.loadVideoById).toHaveBeenCalledExactlyOnceWith({
      videoId: 'third-video',
      startSeconds: 40,
    })
    expect(yt.constructed).toHaveBeenCalledOnce()
  } finally {
    wrapper.unmount()
  }
})

it('waits for the first catalog and retains the player after an empty channel', async () => {
  const yt = youtube()
  const wrapper = mount(YoutubeStage, {
    props: { videoId: null, startSeconds: 0, volume: 80, muted: false },
  })
  try {
    await flushPromises()
    expect(yt.constructed).not.toHaveBeenCalled()
    await wrapper.setProps({ videoId: 'first-video' })
    expect(yt.constructed).toHaveBeenCalledOnce()
    await wrapper.setProps({ videoId: null })
    yt.emit('onReady')
    expect(yt.player.stopVideo).toHaveBeenCalledOnce()
    yt.emit('onStateChange', 1)
    yt.emit('onError', 100)
    expect(wrapper.emitted('playing')).toBeUndefined()
    expect(wrapper.emitted('error')).toBeUndefined()
    await wrapper.setProps({ videoId: 'second-video', startSeconds: 10 })
    expect(yt.constructed).toHaveBeenCalledOnce()
    expect(yt.player.loadVideoById).toHaveBeenLastCalledWith({
      videoId: 'second-video',
      startSeconds: 10,
    })
  } finally {
    wrapper.unmount()
  }
})
