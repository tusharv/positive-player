import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import StationMail from '../components/StationMail.vue'

async function mountMail(path = '/contact') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/contact', component: { template: '<div />' } }],
  })
  await router.push(path)
  await router.isReady()
  return mount(StationMail, { global: { plugins: [router] } })
}

describe('station mail', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens the fields for the kind of note and posts a channel request', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(
        JSON.stringify({ ok: true, url: 'https://github.com/tusharv/positive-player/issues/8' }),
        { status: 200 },
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = await mountMail('/contact?kind=channel&programme=Malgudi%20Days')
    expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe(
      'Malgudi Days',
    )
    await wrapper.get('textarea').setValue('The Sunday episodes, please.')
    await wrapper.get('input[type="email"]').setValue('viewer@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledOnce()
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    expect(body).toMatchObject({
      kind: 'channel',
      programme: 'Malgudi Days',
      message: 'The Sunday episodes, please.',
      email: 'viewer@example.com',
      page: '/contact',
    })
    expect(wrapper.text()).toContain('Thank you for your feedback.')
    expect(wrapper.text()).toContain('Malgudi Days')
    expect(wrapper.text()).toContain('The Sunday episodes, please.')
    expect(wrapper.get('a[href="https://github.com/tusharv/positive-player/issues/8"]').text()).toBe(
      'Read your note on GitHub ↗',
    )
    wrapper.unmount()
  })

  it('highlights the required fields and does not send an empty note', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = await mountMail()
    await wrapper.get('input[value="channel"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('input[type="text"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#programme-error').text()).toMatch(/Name the channel/)
    expect(wrapper.get('#message-error').text()).toMatch(/sentence is enough/)
    wrapper.unmount()
  })

  it('explains a closed mailbox without clearing the form', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { error: 'The mailbox is not open yet. You can still leave a note on GitHub.' },
          { status: 503 },
        ),
      ),
    )
    const wrapper = await mountMail()
    await wrapper.get('input[value="access"]').setValue(true)
    await wrapper.get('textarea').setValue('The page stays blank in Firefox.')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('mailbox is not open yet')
    expect(wrapper.get('textarea').element).toBeTruthy()
    wrapper.unmount()
  })
})
