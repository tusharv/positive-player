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
})
