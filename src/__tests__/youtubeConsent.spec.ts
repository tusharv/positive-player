import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { createPinia } from 'pinia'
import PlayerPage from '../views/PlayerPage.vue'
import PowerGate from '../components/PowerGate.vue'
import { CONSENT_KEY, CONSENT_VERSION, withdrawLegalConsent } from '../lib/legalConsent'

function playerRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: PlayerPage },
      { path: '/privacy', component: { template: '<p>Privacy Policy</p>' } },
      { path: '/terms', component: { template: '<p>Terms of Service</p>' } },
    ],
  })
}

async function mountPlayer(router: Router = playerRouter()) {
  await router.push('/')
  await router.isReady()
  return mount(PlayerPage, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

beforeEach(() => {
  withdrawLegalConsent()
})

afterEach(() => {
  withdrawLegalConsent()
})

describe('YouTube API consent gate', () => {
  it('keeps the set off until the viewer agrees to the Privacy Policy and Terms', async () => {
    const wrapper = await mountPlayer()
    const power = wrapper.get('button.power')

    expect(power.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toMatch(/Privacy Policy/)
    expect(wrapper.text()).toMatch(/Terms of Service/)
    expect(wrapper.find('a[href="/privacy"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/terms"]').exists()).toBe(true)
    expect(wrapper.find('a[href="https://www.youtube.com/t/terms"]').exists()).toBe(true)
    expect(wrapper.find('.smpte').exists()).toBe(true)

    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(power.attributes('disabled')).toBeUndefined()

    await power.trigger('click')
    expect(wrapper.findComponent(PowerGate).exists()).toBe(false)
    expect(localStorage.getItem(CONSENT_KEY)).toBe(CONSENT_VERSION)
  })

  it('does not let keyboard power-on skip the agreement', async () => {
    const wrapper = await mountPlayer()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(PowerGate).exists()).toBe(true)

    await wrapper.get('input[type="checkbox"]').setValue(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(PowerGate).exists()).toBe(false)
  })

  it('hides the consent card after a current agreement and lets returning viewers turn the set on', async () => {
    localStorage.setItem(CONSENT_KEY, CONSENT_VERSION)
    const wrapper = await mountPlayer()
    const power = wrapper.get('button.power')
    expect(power.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    expect(wrapper.find('#consent-title').exists()).toBe(false)
  })

  it('shows a titled consent card the first time', async () => {
    const wrapper = await mountPlayer()
    expect(wrapper.get('#consent-title').text()).toMatch(/station notice/i)
    expect(wrapper.get('fieldset.consent').classes()).toContain('consent')
  })
})
