import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('about and contact page', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  afterEach(() => wrapper?.unmount())

  it.each(['/about', '/contact'])('opens the combined page at %s', async (path) => {
    await router.push(path)
    await router.isReady()
    wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('h1').text()).toContain('antenna.')
    expect(wrapper.find('#contact').text()).toContain('Send a signal.')
    expect(wrapper.find('a[href="https://tusharv.in"]').exists()).toBe(true)
    expect(wrapper.find('a[href="https://failure.company"]').exists()).toBe(true)
    expect(
      wrapper.find('a[href="https://github.com/tusharv/positive-player/issues"]').exists(),
    ).toBe(true)

    const antenna = wrapper.find('button')
    await antenna.trigger('click')
    expect(antenna.attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('[aria-live="polite"]').text()).toContain('Hello, you.')
    await antenna.trigger('click')
    expect(antenna.attributes('aria-pressed')).toBe('false')
  })
})
