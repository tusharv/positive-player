import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useTvStore } from '../stores/tv'
import PlayerPage from '../views/PlayerPage.vue'
import ChannelGuide from '../components/ChannelGuide.vue'

describe('channel guide', () => {
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
    const dialog = wrapper.get('dialog').element as HTMLDialogElement
    dialog.close = vi.fn()
    await wrapper.get('input').trigger('keydown', { key: '1' })
    expect(digits).not.toHaveBeenCalled()
    await wrapper.get('[data-channel="122"]').trigger('click')
    expect(tune).toHaveBeenCalledWith(122)
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('combines text and tag filters, handles empty results, and tunes a channel', async () => {
    const wrapper = mount(ChannelGuide, { props: { currentChannel: 1 } })
    const dialog = wrapper.get('dialog').element as HTMLDialogElement
    dialog.close = vi.fn()
    await wrapper.get('select').setValue('DD Era')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(5)
    await wrapper.get('input').setValue('  RAMAYAN  ')
    expect(wrapper.findAll('[data-channel]')).toHaveLength(2)
    await wrapper.get('[data-channel="122"]').trigger('click')
    expect(wrapper.emitted('tune')).toEqual([[122]])
    expect(dialog.close).toHaveBeenCalledOnce()
    await wrapper.get('input').setValue('no matching show')
    expect(wrapper.text()).toContain('No channels found')
    wrapper.unmount()
  })
})
