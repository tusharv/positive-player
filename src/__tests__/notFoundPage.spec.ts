import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

describe('off-air 404', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  afterEach(() => wrapper?.unmount())

  async function visit(path: string) {
    await router.push(path)
    await router.isReady()
    wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
    await flushPromises()
    return wrapper
  }

  it('treats unknown paths as an empty frequency', async () => {
    const page = await visit('/this-channel-is-dead')

    expect(router.currentRoute.value.name).toBe('not-found')
    expect(page.find('main[aria-labelledby="off-air-title"]').exists()).toBe(true)
    expect(page.get('#off-air-title').text()).toMatch(/no signal/i)
    expect(page.text()).toContain('रुकावट के लिए खेद है')
    expect(page.text()).toMatch(/CH 404/)
    expect(page.text()).toContain('/this-channel-is-dead')
    expect(page.get('a[href="/watch"]').text()).toMatch(/watch tv/i)
    expect(page.get('a[href="/"]').text()).toMatch(/home/i)
    expect(page.find('[data-testid="analog-snow"]').exists()).toBe(true)
  })

  it('does not steal known public routes', () => {
    const paths = router.getRoutes().map((route) => route.path)
    expect(paths).toEqual(expect.arrayContaining(['/', '/watch', '/privacy', '/terms']))
    expect(router.resolve('/privacy').name).not.toBe('not-found')
    expect(router.resolve('/watch').name).not.toBe('not-found')
  })
})
