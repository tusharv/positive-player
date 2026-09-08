import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SmpteBars from '../components/SmpteBars.vue'
import { SMPTE_MID, SMPTE_TOP } from '../lib/smpteBars'

describe('SMPTE color bars', () => {
  it('renders the ECR-1-1978 pattern in order', () => {
    const wrapper = mount(SmpteBars)
    const top = wrapper
      .findAll('[data-row="top"] [data-bar]')
      .map((bar) => bar.attributes('data-bar'))
    const mid = wrapper
      .findAll('[data-row="mid"] [data-bar]')
      .map((bar) => bar.attributes('data-bar'))

    expect(top).toEqual([...SMPTE_TOP])
    expect(mid).toEqual([...SMPTE_MID])
    expect(wrapper.get('[data-bar="minus-i"]').attributes('data-bar')).toBe('minus-i')
    expect(wrapper.get('[data-bar="peak-white"]').attributes('data-bar')).toBe('peak-white')
    expect(wrapper.get('[data-bar="plus-q"]').attributes('data-bar')).toBe('plus-q')
    expect(wrapper.get('[data-bar="pluge"]').attributes('data-bar')).toBe('pluge')
  })
})
