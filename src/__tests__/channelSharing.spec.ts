import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import PlayerPage from '../views/PlayerPage.vue'
import { useTvStore } from '../stores/tv'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

it('opens a shared channel ahead of the saved channel without starting playback', async () => {
  localStorage.setItem('pp-channel', '1')
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/watch', component: PlayerPage },
      { path: '/privacy', component: {} },
      { path: '/terms', component: {} },
    ],
  })
  await router.push('/watch?channel=12')
  const wrapper = mount(PlayerPage, { global: { plugins: [pinia, router] } })
  const tv = useTvStore(pinia)
  expect(tv.channelNumber).toBe(12)
  expect(tv.poweredOn).toBe(false)
  await router.push('/watch?channel=not-a-channel')
  await flushPromises()
  expect(tv.channelNumber).toBe(12)
  wrapper.unmount()
})

it('offers sharing from the HUD and keeps the menu open while controls would fade', async () => {
  vi.useFakeTimers()
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/watch', component: PlayerPage },
      { path: '/privacy', component: {} },
      { path: '/terms', component: {} },
    ],
  })
  await router.push('/watch')
  const wrapper = mount(PlayerPage, { global: { plugins: [pinia, router] } })
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  await wrapper.vm.$nextTick()
  const dialog = wrapper.get('.share-dialog').element as HTMLDialogElement
  dialog.showModal = () => {
    dialog.open = true
  }
  await wrapper.get('[aria-label="Share channel"]').trigger('click')
  await vi.advanceTimersByTimeAsync(5000)
  expect(wrapper.get('.player-controls').attributes('inert')).toBeUndefined()
  expect(dialog.open).toBe(true)
  tv.poweredOn = false
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.share-dialog').exists()).toBe(false)
  wrapper.unmount()
  vi.useRealTimers()
})
