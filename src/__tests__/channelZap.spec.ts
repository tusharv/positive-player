import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChannelZap from '../components/ChannelZap.vue'
import { channelZapNeeded, CHANNEL_ZAP_MS } from '../lib/channelZap'
import * as hardwareVideoPlane from '../lib/hardwareVideoPlane'

describe('channelZapNeeded', () => {
  it('zaps when the set is on and the channel actually changes', () => {
    expect(channelZapNeeded(3, 4, true)).toBe(true)
  })

  it('does not zap when landing on the same channel', () => {
    expect(channelZapNeeded(3, 3, true)).toBe(false)
  })

  it('does not zap before the set is on', () => {
    expect(channelZapNeeded(1, 2, false)).toBe(false)
  })

  it('keeps the burst long enough to read as analog snow', () => {
    expect(CHANNEL_ZAP_MS).toBeGreaterThanOrEqual(300)
  })
})

describe('ChannelZap', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not composite analog snow over a hardware video plane', () => {
    vi.spyOn(hardwareVideoPlane, 'hasHardwareVideoPlane').mockReturnValue(true)
    const wrapper = mount(ChannelZap)
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.classes()).toContain('still')
  })
})
