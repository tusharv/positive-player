import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CrtShell from '../components/CrtShell.vue'
import * as hardwareVideoPlane from '../lib/hardwareVideoPlane'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CrtShell', () => {
  it('paints scanlines and grain over the picture on a compositing browser', () => {
    vi.spyOn(hardwareVideoPlane, 'hasHardwareVideoPlane').mockReturnValue(false)
    const wrapper = mount(CrtShell)
    expect(wrapper.find('.crt-scan').exists()).toBe(true)
    expect(wrapper.find('.crt-grain').exists()).toBe(true)
    expect(wrapper.find('.crt-vignette').exists()).toBe(true)
    expect(wrapper.classes()).not.toContain('crt--plane')
  })

  it('does not cover the picture on a hardware video plane', () => {
    vi.spyOn(hardwareVideoPlane, 'hasHardwareVideoPlane').mockReturnValue(true)
    const wrapper = mount(CrtShell)
    expect(wrapper.find('.crt-scan').exists()).toBe(false)
    expect(wrapper.find('.crt-grain').exists()).toBe(false)
    expect(wrapper.find('.crt-vignette').exists()).toBe(false)
    expect(wrapper.classes()).toContain('crt--plane')
  })
})
