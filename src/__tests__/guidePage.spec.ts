import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import GuidePage from '../views/GuidePage.vue'
import { CHANNELS } from '../data/channels'

vi.mock('../data/channels', () => {
  const CHANNELS = [1, 2].map((number) => ({
    number,
    name: `Station ${number}`,
    kind: 'curated',
    tags: [],
    loadCuratedCatalog: vi.fn(async () => [
      { videoId: `video${number}`, title: `Programme ${number}`, durationSeconds: 100000 },
    ]),
  }))
  return {
    CHANNELS,
    channelByNumber: (number: number) => CHANNELS.find((channel) => channel.number === number),
    formatChannelLabel: (channel: { name: string }) => channel.name,
  }
})
afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})
it('loads only the requested channel and updates the guide when the selection changes', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/guide', component: {} },
      { path: '/watch', component: {} },
      { path: '/', component: {} },
    ],
  })
  await router.push('/guide?channel=2')
  const wrapper = mount(GuidePage, { global: { plugins: [router] } })
  await flushPromises()
  expect(wrapper.get('h2').text()).toBe('Station 2')
  expect(wrapper.get('.on-now').text()).toContain('Programme 2')
  expect(CHANNELS[0]!.loadCuratedCatalog).not.toHaveBeenCalled()
  expect(wrapper.get('.watch-link').attributes('href')).toBe('/watch?channel=2')
  await wrapper.get('select').setValue('1')
  await flushPromises()
  expect(wrapper.get('.on-now').text()).toContain('Programme 1')
  expect(router.currentRoute.value.query.channel).toBe('1')
  wrapper.unmount()
})
