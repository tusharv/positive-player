import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

describe('landing page navigation', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  afterEach(() => wrapper?.unmount())

  it('lets a visitor enter the television without bypassing its power and consent gate', async () => {
    localStorage.clear()
    await router.push('/')
    await router.isReady()
    wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
    await flushPromises()
    const watch = wrapper.find('a[href="/watch"]')
    expect(watch.exists()).toBe(true)
    await watch.trigger('click')
    await expect.poll(() => router.currentRoute.value.path).toBe('/watch')
    await flushPromises()
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Press to turn on')
  })
})
