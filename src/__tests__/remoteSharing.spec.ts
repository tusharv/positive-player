import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RemotePage from '../views/RemotePage.vue'

class Socket {
  static current: Socket
  onmessage: ((event: { data: string }) => void) | null = null
  constructor() {
    Socket.current = this
  }
  close() {}
  message(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}
afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})
it('shares the live TV channel without exposing the remote invitation, and closes on disconnect', async () => {
  vi.stubGlobal('WebSocket', Socket)
  window.history.replaceState(null, '', '/remote#invite=private-invitation')
  const wrapper = mount(RemotePage, { global: { stubs: { RouterLink: true } } })
  Socket.current.message({ type: 'session', role: 'remote', id: 'id', token: 'private-token' })
  Socket.current.message({ type: 'presence', hostOnline: true })
  const state = {
    poweredOn: true,
    channelNumber: 12,
    volume: 50,
    muted: false,
    interruption: 'none',
  }
  Socket.current.message({ type: 'state', state })
  await wrapper.vm.$nextTick()
  const dialog = wrapper.get('dialog').element
  dialog.showModal = () => {
    dialog.open = true
  }
  dialog.close = () => {
    dialog.open = false
    dialog.dispatchEvent(new Event('close'))
  }
  await wrapper.get('[aria-label="Share channel"]').trigger('click')
  expect(wrapper.get<HTMLInputElement>('.share-dialog input').element.value).toBe(
    `${location.origin}/watch?channel=12`,
  )
  Socket.current.message({ type: 'state', state: { ...state, channelNumber: 3 } })
  await wrapper.vm.$nextTick()
  expect(wrapper.get<HTMLInputElement>('.share-dialog input').element.value).toBe(
    `${location.origin}/watch?channel=3`,
  )
  Socket.current.message({ type: 'presence', hostOnline: false })
  await wrapper.vm.$nextTick()
  expect(dialog.open).toBe(false)
  expect(wrapper.get('[aria-label="Share channel"]').attributes('disabled')).toBeDefined()
  wrapper.unmount()
})
