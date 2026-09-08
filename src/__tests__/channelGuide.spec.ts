import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useTvStore } from '../stores/tv'
import PlayerPage from '../views/PlayerPage.vue'
import ChannelGuide from '../components/ChannelGuide.vue'

describe('channel guide', () => {
  it('opens inside the TV and returns focus when Escape closes the guide', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 }, attachTo: document.body })
    expect(wrapper.find('#channel-guide').exists()).toBe(false)
    await wrapper.get('.guide-launch').trigger('click')
    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    await wrapper.get('input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('#channel-guide').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('.guide-launch').element)
    wrapper.unmount()
  })

  it('tunes from the player guide without passing search keystrokes to the TV', async () => {
    const pinia = createPinia()
    const tv = useTvStore(pinia)
    tv.poweredOn = true
    const tune = vi.spyOn(tv, 'setChannel').mockImplementation(() => {})
    const digits = vi.spyOn(tv, 'typeDigit')
    const wrapper = mount(PlayerPage, {
      global: { plugins: [pinia], stubs: { RemotePairing: true, YoutubeStage: true } },
      attachTo: document.body,
    })
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('input').trigger('keydown', { key: '1' })
    expect(digits).not.toHaveBeenCalled()
    await wrapper.get('[data-channel="122"]').trigger('click')
    expect(tune).toHaveBeenCalledWith(122)
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('combines text and tag filters, handles empty results, and tunes a channel', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 } })
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('select').setValue('DD Era')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(5)
    await wrapper.get('input').setValue('  RAMAYAN  ')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(2)
    await wrapper.get('[data-channel="122"]').trigger('click')
    expect(wrapper.emitted('tune')).toEqual([[122]])
    expect(wrapper.find('#channel-guide').exists()).toBe(false)
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('input').setValue('no matching show')
    expect(wrapper.text()).toContain('No channels found')
    wrapper.unmount()
  })
})
