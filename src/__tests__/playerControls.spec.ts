import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { channelByNumber } from '../data/channels'
import { channelCatalogKey } from '../lib/youtubeData'
import PlayerPage from '../views/PlayerPage.vue'
import { useTvStore } from '../stores/tv'

let wrapper: VueWrapper
beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  wrapper?.unmount()
  sessionStorage.clear()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function setup(stubPairing = true) {
  const pinia = createPinia()
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  wrapper = mount(PlayerPage, {
    attachTo: document.body,
    global: { plugins: [pinia], stubs: { RemotePairing: stubPairing, YoutubeStage: true } },
  })
  return tv
}
it('recalls the previous channel and cycles the sleep timer', async () => {
  const tv = setup()
  expect(wrapper.get('[aria-label="Last channel"]').attributes('disabled')).toBeDefined()
  await wrapper.get('[aria-label="Next channel"]').trigger('click')
  expect(tv.channelNumber).toBe(2)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }))
  await wrapper.vm.$nextTick()
  expect(tv.channelNumber).toBe(1)
  await wrapper.get('[aria-label="Last channel"]').trigger('click')
  expect(tv.channelNumber).toBe(2)
  await wrapper.get('[aria-label="Sleep timer"]').trigger('click')
  expect(tv.sleepMinutes).toBe(30)
  expect(wrapper.get('.sleep-notice').text()).toBe('SLEEP 30')
  expect(wrapper.get('.sleep-mark').text()).toBe('SLEEP 30')
  await vi.advanceTimersByTimeAsync(4000)
  expect(wrapper.find('.sleep-notice').exists()).toBe(false)
  expect(wrapper.get('.sleep-mark').text()).toBe('SLEEP 30')
})
it('shows the programme title on the glass until the controls fade', async () => {
  sessionStorage.setItem(
    channelCatalogKey(channelByNumber(1)!),
    JSON.stringify({
      items: [{ videoId: 'show', title: '  Evening raga  ', durationSeconds: 5000 }],
      fetchedAt: Date.now(),
    }),
  )
  const pinia = createPinia()
  const tv = useTvStore(pinia)
  wrapper = mount(PlayerPage, {
    attachTo: document.body,
    global: { plugins: [pinia], stubs: { RemotePairing: true, YoutubeStage: true } },
  })
  tv.powerOn()
  await flushPromises()
  expect(wrapper.get('.programme-title').text()).toBe('Evening raga')
  await vi.advanceTimersByTimeAsync(4000)
  expect(wrapper.find('.programme-title').exists()).toBe(false)
})
it('changes channels with on-screen controls without a paired phone', async () => {
  const tv = setup()
  await wrapper.get('[aria-label="Next channel"]').trigger('click')
  expect(tv.channelNumber).toBe(2)
  await wrapper.get('[aria-label="Previous channel"]').trigger('click')
  expect(tv.channelNumber).toBe(1)
  await wrapper.get('.guide-launch').trigger('click')
  await wrapper.get('[data-channel="6"]').trigger('click')
  expect(tv.channelNumber).toBe(6)
})
it('moves focus between controls without tuning and activates with TV Enter', async () => {
  const tv = setup()
  const previous = wrapper.get<HTMLButtonElement>('[aria-label="Previous channel"]')
  previous.element.focus()
  await previous.trigger('keydown', { key: 'ArrowRight' })
  expect(document.activeElement).toBe(wrapper.get('[aria-label="Next channel"]').element)
  expect(tv.channelNumber).toBe(1)
  await wrapper.get('[aria-label="Next channel"]').trigger('keydown', { key: 'Enter' })
  expect(tv.channelNumber).toBe(2)
})
it('expands the whole player and follows native fullscreen exit', async () => {
  setup()
  let fullscreen: Element | null = null
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreen,
  })
  const request = vi.fn(async function (this: Element) {
    fullscreen = this
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  Object.defineProperty(wrapper.element, 'requestFullscreen', {
    configurable: true,
    value: request,
  })
  await wrapper.get('[aria-label="Enter fullscreen"]').trigger('click')
  await flushPromises()
  expect(fullscreen).toBe(wrapper.element)
  expect(wrapper.get('.crt').classes()).toContain('crt--expanded')
  expect(wrapper.find('[aria-label="Next channel"]').exists()).toBe(true)
  fullscreen = null
  document.dispatchEvent(new Event('fullscreenchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.find('[aria-label="Enter fullscreen"]').exists()).toBe(true)
  expect(wrapper.get('.crt').classes()).not.toContain('crt--expanded')
  delete (document as unknown as Record<string, unknown>).fullscreenElement
})
it('offers a reversible full-window view if native fullscreen is denied', async () => {
  setup()
  Object.defineProperty(wrapper.element, 'requestFullscreen', {
    configurable: true,
    value: () => Promise.reject(new Error('Denied')),
  })
  await wrapper.get('[aria-label="Enter fullscreen"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('.crt').classes()).toContain('crt--expanded')
  expect(wrapper.get('[role="status"]').text()).toContain('browser')
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('.crt').classes()).not.toContain('crt--expanded')
})
it('keeps volume, mute and number shortcuts working while a channel button has focus', async () => {
  const tv = setup()
  const next = wrapper.get<HTMLButtonElement>('[aria-label="Next channel"]')
  next.element.focus()
  await next.trigger('keydown', { key: '-' })
  expect(tv.volume.volume).toBe(75)
  await next.trigger('keydown', { key: 'm' })
  expect(tv.volume.muted).toBe(true)
  await next.trigger('keydown', { key: '0' })
  await next.trigger('keydown', { key: '0' })
  await next.trigger('keydown', { key: '3' })
  expect(tv.channelNumber).toBe(3)
})
it('exits a full-window fallback using the on-screen button when the API is missing', async () => {
  setup()
  await wrapper.get('[aria-label="Enter fullscreen"]').trigger('click')
  expect(wrapper.get('.crt').classes()).toContain('crt--expanded')
  await wrapper.get('[aria-label="Exit fullscreen"]').trigger('click')
  expect(wrapper.get('.crt').classes()).not.toContain('crt--expanded')
})
it('supports prefixed fullscreen and exits through the TV Back key', async () => {
  setup()
  let fullscreen: Element | null = null
  Object.defineProperty(document, 'webkitFullscreenElement', {
    configurable: true,
    get: () => fullscreen,
  })
  Object.defineProperty(wrapper.element, 'webkitRequestFullscreen', {
    configurable: true,
    value: () => {
      fullscreen = wrapper.element
      document.dispatchEvent(new Event('webkitfullscreenchange'))
    },
  })
  Object.defineProperty(document, 'webkitExitFullscreen', {
    configurable: true,
    value: () => {
      fullscreen = null
      document.dispatchEvent(new Event('webkitfullscreenchange'))
    },
  })
  try {
    await wrapper.get('[aria-label="Enter fullscreen"]').trigger('click')
    expect(fullscreen).toBe(wrapper.element)
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 10009 }))
    await flushPromises()
    expect(fullscreen).toBeNull()
    expect(wrapper.get('.crt').classes()).not.toContain('crt--expanded')
  } finally {
    delete (document as unknown as Record<string, unknown>).webkitFullscreenElement
    delete (document as unknown as Record<string, unknown>).webkitExitFullscreen
  }
})
it('hides the HUD after four seconds and restarts the timeout on mouse movement', async () => {
  setup()
  await vi.advanceTimersByTimeAsync(3900)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).not.toBe('true')
  await wrapper.trigger('pointermove', { pointerType: 'mouse' })
  await vi.advanceTimersByTimeAsync(3900)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).not.toBe('true')
  await vi.advanceTimersByTimeAsync(100)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('true')
  expect(wrapper.find('.channel-label').exists()).toBe(false)
  await wrapper.trigger('pointermove', { pointerType: 'mouse' })
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  expect(wrapper.find('.channel-label').exists()).toBe(true)
})
it('uses the first touch to reveal controls without changing channel', async () => {
  const tv = setup()
  await vi.advanceTimersByTimeAsync(4000)
  await wrapper.get('[aria-label="Show player controls"]').trigger('click')
  expect(tv.channelNumber).toBe(1)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  await wrapper.get('[aria-label="Next channel"]').trigger('click')
  expect(tv.channelNumber).toBe(2)
})
it('wakes on TV OK without activating the previously focused channel button', async () => {
  const tv = setup()
  wrapper.get<HTMLButtonElement>('[aria-label="Next channel"]').element.focus()
  await vi.advanceTimersByTimeAsync(4000)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('true')
  expect(document.activeElement).toBe(wrapper.element)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
  await wrapper.vm.$nextTick()
  expect(tv.channelNumber).toBe(1)
  expect(document.activeElement).toBe(wrapper.get('[aria-label="Next channel"]').element)
  await wrapper.get('[aria-label="Next channel"]').trigger('keydown', { key: 'Enter' })
  expect(tv.channelNumber).toBe(2)
})
it('keeps an open channel guide visible and starts a fresh timeout after closing', async () => {
  setup()
  await wrapper.get('.guide-launch').trigger('click')
  await vi.advanceTimersByTimeAsync(12000)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  expect(wrapper.find('#channel-guide').exists()).toBe(true)
  await wrapper.get('[aria-label="Close channel guide"]').trigger('click')
  await vi.advanceTimersByTimeAsync(3999)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  await vi.advanceTimersByTimeAsync(1)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('true')
})
it('resumes auto-hide after powering off with the channel guide open', async () => {
  const tv = setup()
  await wrapper.get('.guide-launch').trigger('click')
  tv.poweredOn = false
  await wrapper.vm.$nextTick()
  tv.poweredOn = true
  await wrapper.vm.$nextTick()
  await vi.advanceTimersByTimeAsync(4000)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('true')
})
it('keeps pairing visible until its dialog closes', async () => {
  setup()
  const pairing = wrapper.findComponent({ name: 'RemotePairing' })
  pairing.vm.$emit('open-change', true)
  await wrapper.vm.$nextTick()
  await vi.advanceTimersByTimeAsync(12000)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  pairing.vm.$emit('open-change', false)
  await wrapper.vm.$nextTick()
  await vi.advanceTimersByTimeAsync(4000)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('true')
})
it('adjusts volume in five-percent steps and restores sound after muting', async () => {
  const tv = setup()
  await wrapper.get('[aria-label="Volume down"]').trigger('click')
  expect(tv.volume.volume).toBe(75)
  await wrapper.get('[aria-label="Volume up"]').trigger('click')
  expect(tv.volume.volume).toBe(80)
  await wrapper.get('[aria-label="Mute"]').trigger('click')
  expect(tv.volume.muted).toBe(true)
  expect(wrapper.get('[aria-label="Unmute"]').attributes('aria-pressed')).toBe('true')
  await wrapper.get('[aria-label="Unmute"]').trigger('click')
  expect(tv.volume.muted).toBe(false)
  expect(tv.volume.volume).toBe(80)
})
it('supports remote navigation from the channel guide to volume controls', async () => {
  const tv = setup()
  const guide = wrapper.get<HTMLButtonElement>('.guide-launch')
  guide.element.focus()
  await guide.trigger('keydown', { key: 'ArrowRight' })
  expect(document.activeElement).toBe(wrapper.get('[aria-label="Volume down"]').element)
  await wrapper.get('[aria-label="Volume down"]').trigger('keydown', { key: 'Enter' })
  expect(tv.volume.volume).toBe(75)
  expect(tv.channelNumber).toBe(1)
})

it('uses bracket shortcuts while a HUD button has focus and reveals hidden controls', async () => {
  const tv = setup()
  await vi.advanceTimersByTimeAsync(4000)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ']', cancelable: true }))
  await wrapper.vm.$nextTick()
  expect(tv.channelNumber).toBe(2)
  expect(wrapper.get('.player-controls').attributes('aria-hidden')).toBe('false')
  await wrapper.get('[aria-label="Next channel"]').trigger('keydown', { key: '[' })
  expect(tv.channelNumber).toBe(1)
})

it('opens the guide and share menu and toggles fullscreen using letter shortcuts', async () => {
  setup()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'C' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.find('#channel-guide').exists()).toBe(true)
  await wrapper.get('[aria-label="Close channel guide"]').trigger('click')
  const dialog = wrapper.get('.share-dialog').element as HTMLDialogElement
  dialog.showModal = () => {
    dialog.open = true
  }
  dialog.close = () => {
    dialog.open = false
    dialog.dispatchEvent(new Event('close'))
  }
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
  await wrapper.vm.$nextTick()
  expect(dialog.open).toBe(true)
  await wrapper.get('[aria-label="Close sharing"]').trigger('click')
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('.crt').classes()).toContain('crt--expanded')
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', repeat: true }))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('.crt').classes()).toContain('crt--expanded')
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('.crt').classes()).not.toContain('crt--expanded')
})

it('does not hijack modified keys, text entry, composition, or an open guide', async () => {
  const tv = setup()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '-', metaKey: true }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ']', altKey: true }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', isComposing: true }))
  expect(tv.volume.muted).toBe(false)
  expect(tv.volume.volume).toBe(80)
  expect(tv.channelNumber).toBe(1)
  await wrapper.get('.guide-launch').trigger('click')
  await wrapper.get('input').trigger('keydown', { key: 'm' })
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }))
  expect(tv.channelNumber).toBe(1)
  expect(tv.volume.muted).toBe(false)
})

it('advertises the shortcut on every player HUD action', () => {
  setup()
  for (const selector of [
    '[aria-label="Previous channel"]',
    '[aria-label="Next channel"]',
    '.guide-launch',
    '[aria-label="Volume down"]',
    '[aria-label="Volume up"]',
    '[aria-label="Mute"]',
    '.share-launch',
    '[aria-label="Enter fullscreen"]',
  ]) {
    const button = wrapper.get(selector)
    expect(button.attributes('data-shortcut')).toBeTruthy()
    expect(button.attributes('aria-keyshortcuts')).toBeTruthy()
  }
})

it('opens phone pairing with R and shows its key hint', async () => {
  vi.stubGlobal(
    'WebSocket',
    class {
      close() {}
    },
  )
  setup(false)
  const dialog = wrapper.get('.pair-dialog').element as HTMLDialogElement
  dialog.showModal = () => {
    dialog.open = true
  }
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }))
  await wrapper.vm.$nextTick()
  expect(dialog.open).toBe(true)
  expect(wrapper.get('.remote-launch').attributes('data-shortcut')).toContain('R')
})
