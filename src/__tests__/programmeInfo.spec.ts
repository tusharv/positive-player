import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import ProgrammeInfo from '../components/ProgrammeInfo.vue'
import PlayerPage from '../views/PlayerPage.vue'
import { useTvStore } from '../stores/tv'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
it('shows the playing title and duration and links to this channel’s schedule', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/guide', component: {} }],
  })
  await router.push('/guide')
  const wrapper = mount(ProgrammeInfo, {
    props: {
      programme: { videoId: 'a', title: 'A video song', durationSeconds: 300 },
      channelNumber: 12,
      channelLabel: 'CH 012',
    },
    global: { plugins: [router] },
    attachTo: document.body,
  })
  const dialog = wrapper.get('dialog').element as HTMLDialogElement
  dialog.showModal = () => {
    dialog.open = true
  }
  await wrapper.get('.info-launch').trigger('click')
  expect(wrapper.emitted('open-change')?.[0]).toEqual([true])
  expect(wrapper.get('h2').text()).toBe('A video song')
  expect(wrapper.text()).toContain('5m')
  expect(wrapper.get('a').attributes('href')).toBe('/guide?channel=12')
  await wrapper.get('dialog').trigger('close')
  expect(document.activeElement).toBe(wrapper.get('.info-launch').element)
  wrapper.unmount()
})
it('pins the HUD while info is open and removes it when powered off', async () => {
  vi.useFakeTimers()
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/watch', component: {} },
      { path: '/guide', component: {} },
    ],
  })
  await router.push('/watch')
  const tv = useTvStore(pinia)
  tv.poweredOn = true
  const wrapper = mount(PlayerPage, {
    global: { plugins: [pinia, router], stubs: { YoutubeStage: true, RemotePairing: true } },
  })
  const dialog = wrapper.get('.programme-info').element as HTMLDialogElement
  dialog.showModal = () => {
    dialog.open = true
  }
  await wrapper.get('.info-launch').trigger('click')
  await vi.advanceTimersByTimeAsync(5000)
  expect(wrapper.get('.player-controls').attributes('inert')).toBeUndefined()
  expect(wrapper.findAll('.info-launch')).toHaveLength(1)
  expect(dialog.open).toBe(true)
  tv.poweredOn = false
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.programme-info').exists()).toBe(false)
  wrapper.unmount()
})
