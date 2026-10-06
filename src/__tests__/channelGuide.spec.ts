import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useTvStore } from '../stores/tv'
import PlayerPage from '../views/PlayerPage.vue'
import ChannelGuide from '../components/ChannelGuide.vue'

describe('channel guide', () => {
  it('navigates filtered channels with arrows and returns to search at the top', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 }, attachTo: document.body })
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('input').setValue('mythology')
    const channels = wrapper.findAll<HTMLButtonElement>('[data-channel]')
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(channels[0]!.element)
    await channels[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(channels[1]!.element)
    await channels[1]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(channels[1]!.element)
    await channels[1]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(channels[0]!.element)
    await channels[0]!.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(wrapper.get('input').element)
    await wrapper.get('input').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(channels[1]!.element)
    wrapper.unmount()
  })

  it('preserves editing and native tag navigation and handles empty results', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 }, attachTo: document.body })
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('input').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(wrapper.get('input').element)
    const select = wrapper.get<HTMLSelectElement>('select')
    select.element.focus()
    await select.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(select.element)
    await wrapper.get('input').setValue('no matching show')
    wrapper.get<HTMLInputElement>('input').element.focus()
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })

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
    await wrapper.get('[data-channel="6"]').trigger('click')
    expect(tune).toHaveBeenCalledWith(6)
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('combines text and tag filters, handles empty results, and tunes a channel', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 } })
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('select').setValue('DD Era')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(6)
    await wrapper.get('input').setValue('  RAMAYAN  ')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(1)
    await wrapper.get('[data-channel="6"]').trigger('click')
    expect(wrapper.emitted('tune')).toEqual([[6]])
    expect(wrapper.find('#channel-guide').exists()).toBe(false)
    await wrapper.get('.guide-launch').trigger('click')
    await wrapper.get('input').setValue('no matching show')
    expect(wrapper.text()).toContain('No channels found')
    wrapper.unmount()
  })
})
