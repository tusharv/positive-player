import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useTvStore } from '../stores/tv'
import PlayerPage from '../views/PlayerPage.vue'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('shows the volume bar on keyboard adjustment and hides it after five seconds', async () => {
  vi.useFakeTimers()
  const pinia = createPinia()
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  const wrapper = mount(PlayerPage, {
    attachTo: document.body,
    global: { plugins: [pinia], stubs: { RemotePairing: true } },
  })
  expect(wrapper.find('[role="meter"]').exists()).toBe(false)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('[role="meter"]').isVisible()).toBe(true)
  expect(wrapper.get('[role="meter"]').attributes('aria-valuenow')).toBe(String(tv.volume.volume))
  await vi.advanceTimersByTimeAsync(5000)
  expect(wrapper.find('[role="meter"]').exists()).toBe(false)
  wrapper.unmount()
})

it('still displays volume changes when browser storage is unavailable', async () => {
  vi.useFakeTimers()
  const pinia = createPinia()
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  const wrapper = mount(PlayerPage, {
    global: { plugins: [pinia], stubs: { RemotePairing: true } },
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'QuotaExceededError')
  })
  expect(() => tv.volumeStep(-5)).not.toThrow()
  await wrapper.vm.$nextTick()
  expect(wrapper.get('[role="meter"]').isVisible()).toBe(true)
  expect(() => tv.muteToggle()).not.toThrow()
  await wrapper.vm.$nextTick()
  expect(wrapper.get('[role="meter"]').attributes('aria-valuetext')).toBe('Muted')
  wrapper.unmount()
})
