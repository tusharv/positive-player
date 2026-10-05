import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('../lib/hardwareVideoPlane', () => ({
  hasHardwareVideoPlane: vi.fn(() => false),
}))

import YoutubeStage from '../components/YoutubeStage.vue'
import { hasHardwareVideoPlane } from '../lib/hardwareVideoPlane'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.replaceChildren()
})

async function setup() {
  let options: Record<string, unknown> = {}
  const iframe = document.createElement('iframe')
  const page = document.createElement('main')
  page.className = 'page'
  page.tabIndex = -1
  document.body.append(iframe, page)
  const player = {
    loadVideoById: vi.fn(),
    getVideoUrl: () => 'https://www.youtube.com/watch?v=first-video',
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
    unloadModule: vi.fn(),
    getIframe: () => iframe,
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
  const wrapper = mount(YoutubeStage, {
    props: { videoId: 'first-video', startSeconds: 12, volume: 50, muted: false },
  })
  await flushPromises()
  const events = options.events as {
    onReady: () => void
    onStateChange: (event: { data: number }) => void
  }
  const playerVars = options.playerVars as { autohide?: number; controls: number; start: number }
  return { wrapper, iframe, page, events, playerVars }
}

describe('YouTube chrome on a TV browser', () => {
  it('keeps the iframe out of remote focus so the pause icon can fade', async () => {
    vi.mocked(hasHardwareVideoPlane).mockReturnValue(true)
    const { wrapper, iframe, page, events, playerVars } = await setup()
    try {
      expect(playerVars.controls).toBe(0)
      expect(playerVars.autohide).toBe(1)
      expect(playerVars.start).toBe(12)
      const channel = document.createElement('button')
      channel.setAttribute('aria-label', 'Next channel')
      const controls = document.createElement('div')
      controls.className = 'player-controls'
      controls.append(channel)
      document.body.append(controls)
      iframe.focus()
      events.onReady()
      expect(iframe.tabIndex).toBe(-1)
      expect(iframe.style.pointerEvents).toBe('none')
      expect(document.activeElement).toBe(channel)
      channel.remove()
      controls.remove()

      iframe.focus()
      expect(document.activeElement).toBe(page)
      events.onStateChange({ data: 1 })
      expect(iframe.tabIndex).toBe(-1)
    } finally {
      wrapper.unmount()
    }
  })

  it('leaves desktop focus and player vars alone', async () => {
    vi.mocked(hasHardwareVideoPlane).mockReturnValue(false)
    const { wrapper, iframe, events, playerVars } = await setup()
    try {
      expect(playerVars.autohide).toBeUndefined()
      iframe.tabIndex = 0
      iframe.focus()
      events.onReady()
      expect(document.activeElement).toBe(iframe)
      expect(iframe.tabIndex).toBe(0)
    } finally {
      wrapper.unmount()
    }
  })
})
