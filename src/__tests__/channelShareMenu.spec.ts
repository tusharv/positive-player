import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ChannelShare from '../components/ChannelShare.vue'

function mountShare() {
  const wrapper = mount(ChannelShare, { props: { channelNumber: 12 } })
  const dialog = wrapper.get('dialog').element
  dialog.showModal = () => {
    dialog.open = true
  }
  dialog.close = () => {
    dialog.open = false
    dialog.dispatchEvent(new Event('close'))
  }
  return wrapper
}
afterEach(() => vi.restoreAllMocks())

it('shares a clean player link and updates when the channel changes', async () => {
  const wrapper = mountShare()
  await wrapper.get('button').trigger('click')
  expect(wrapper.get('dialog').element.open).toBe(true)
  const whatsapp = new URL(wrapper.get('a[data-service="WhatsApp"]').attributes('href')!)
  expect(whatsapp.searchParams.get('text')).toContain('/watch?channel=12')
  expect(wrapper.get('a[data-service="Facebook"]').attributes('href')!).toContain('channel%3D12')
  await wrapper.setProps({ channelNumber: 3 })
  expect(wrapper.get<HTMLInputElement>('input').element.value).toBe(
    `${location.origin}/watch?channel=3`,
  )
  await wrapper.get('[aria-label="Close sharing"]').trigger('click')
  expect(wrapper.emitted('open-change')).toEqual([[true], [false]])
  wrapper.unmount()
})

it('copies the channel URL and offers manual copying when clipboard access fails', async () => {
  let copied = ''
  const writeText = vi.fn(async (text: string) => {
    copied = text
  })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const wrapper = mountShare()
  await wrapper.get('button').trigger('click')
  await wrapper.get('[data-action="copy"]').trigger('click')
  await flushPromises()
  expect(copied).toBe(`${location.origin}/watch?channel=12`)
  expect(wrapper.get('[role="status"]').text()).toContain('copied')
  writeText.mockRejectedValueOnce(new Error('denied'))
  await wrapper.get('[data-action="copy"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('[role="status"]').text()).toContain('manually')
  wrapper.unmount()
})
