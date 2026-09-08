import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'
import PrivacyPage from '../views/PrivacyPage.vue'
import TermsPage from '../views/TermsPage.vue'

const GOOGLE_PRIVACY = 'http://www.google.com/policies/privacy'
const YOUTUBE_TOS = 'https://www.youtube.com/t/terms'

async function mountPage(to: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<p>TV</p>' } },
      { path: '/privacy', component: PrivacyPage },
      { path: '/terms', component: TermsPage },
    ],
  })
  await router.push(to)
  await router.isReady()
  return mount(App, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('Privacy Policy', () => {
  it('discloses YouTube API Services and required Google links', async () => {
    const wrapper = await mountPage('/privacy')
    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'))

    expect(wrapper.text()).toMatch(/YouTube API Services/)
    expect(wrapper.text()).toMatch(
      /does not (request|require) access to your Google or YouTube account/i,
    )
    expect(wrapper.text()).toMatch(/advertisements?/i)
    expect(wrapper.text()).toMatch(/cookies?/i)
    expect(wrapper.text()).toMatch(/localStorage|browser storage/i)
    expect(hrefs).toContain(GOOGLE_PRIVACY)
    expect(hrefs).toContain(YOUTUBE_TOS)
    expect(hrefs).toContain('https://security.google.com/settings/security/permissions')
    expect(wrapper.get('a[href="/terms"]').text()).toMatch(/terms of service/i)
  })
})

describe('Terms of Service', () => {
  it('binds viewers to the YouTube Terms of Service', async () => {
    const wrapper = await mountPage('/terms')
    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'))

    expect(wrapper.text()).toMatch(/YouTube API Services/)
    expect(wrapper.text()).toMatch(/agreeing to be bound by the YouTube Terms of Service/)
    expect(hrefs).toContain(YOUTUBE_TOS)
    expect(hrefs).toContain(GOOGLE_PRIVACY)
    expect(wrapper.get('a[href="/privacy"]').text()).toMatch(/privacy policy/i)
  })
})

it('publishes privacy and terms on unauthenticated routes', () => {
  const paths = router.getRoutes().map((route) => route.path)
  expect(paths).toEqual(expect.arrayContaining(['/privacy', '/terms']))
})
