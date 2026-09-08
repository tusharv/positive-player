import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import RemotePairing from '../components/RemotePairing.vue'
import { useTvRemote } from '../composables/useTvRemote'

vi.mock('../composables/useTvRemote', () => ({ useTvRemote: vi.fn() }))

it('waits for connection, cancels on connection loss, and closes five seconds after reconnection', async () => {
  vi.useFakeTimers()
  const remote = {
    status: ref('connecting' as const),
    paired: ref(false),
    remoteOnline: ref(false),
    code: ref(''),
    invite: ref(''),
    expiresAt: ref(0),
    error: ref(''),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
  vi.mocked(useTvRemote).mockReturnValue(remote)
  const wrapper = mount(RemotePairing)
  const dialog = wrapper.get('dialog').element as HTMLDialogElement
  dialog.showModal = () => dialog.setAttribute('open', '')
  dialog.close = () => dialog.removeAttribute('open')
  try {
    await wrapper.get('.remote-launch').trigger('click')
    await vi.advanceTimersByTimeAsync(10000)
    expect(dialog.open).toBe(true)
    remote.paired.value = true
    remote.remoteOnline.value = true
    await nextTick()
    await vi.advanceTimersByTimeAsync(4000)
    remote.remoteOnline.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(5000)
    expect(dialog.open).toBe(true)
    remote.remoteOnline.value = true
    await nextTick()
    await vi.advanceTimersByTimeAsync(4999)
    expect(dialog.open).toBe(true)
    await vi.advanceTimersByTimeAsync(1)
    expect(dialog.open).toBe(false)
    expect(remote.disconnect).not.toHaveBeenCalled()
    await wrapper.get('.remote-launch').trigger('click')
    await vi.advanceTimersByTimeAsync(5000)
    expect(dialog.open).toBe(false)
  } finally {
    wrapper.unmount()
    vi.restoreAllMocks()
    vi.useRealTimers()
  }
})
