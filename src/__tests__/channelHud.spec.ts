import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ChannelHud from '../components/ChannelHud.vue'

describe('ChannelHud', () => {
  it('does not keep a full-screen overlay when the HUD is hidden', () => {
    const wrapper = mount(ChannelHud, {
      props: {
        label: 'CH 001  NATURE',
        pendingDigits: '',
        volume: 80,
        muted: false,
        visible: false,
        volumeVisible: false,
      },
    })
    expect(wrapper.find('.hud').exists()).toBe(false)
    expect(wrapper.find('.channel-label').exists()).toBe(false)
    expect(wrapper.find('[role="meter"]').exists()).toBe(false)
  })

  it('shows the programme title in the channel label and keeps a small sleep mark', async () => {
    const wrapper = mount(ChannelHud, {
      props: {
        label: 'CH 001  NATURE',
        programmeTitle: 'Evening raga',
        pendingDigits: '',
        volume: 80,
        muted: false,
        visible: true,
        volumeVisible: false,
        sleepMinutes: 30,
        sleepNotice: 'SLEEP 30',
        sleepNoticeVisible: true,
      },
    })
    expect(wrapper.get('.programme-title').text()).toBe('Evening raga')
    expect(wrapper.get('.sleep-notice').text()).toBe('SLEEP 30')
    expect(wrapper.get('.sleep-mark').text()).toBe('SLEEP 30')
    await wrapper.setProps({ pendingDigits: '1' })
    expect(wrapper.find('.programme-title').exists()).toBe(false)
    await wrapper.setProps({ visible: false, sleepNoticeVisible: false, pendingDigits: '' })
    expect(wrapper.find('.channel-label').exists()).toBe(false)
    expect(wrapper.find('.sleep-notice').exists()).toBe(false)
    expect(wrapper.get('.sleep-mark').text()).toBe('SLEEP 30')
  })
})
