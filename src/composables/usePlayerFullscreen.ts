import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => void | Promise<void> }
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void | Promise<void>
}

export function usePlayerFullscreen(host: Ref<HTMLElement | null>) {
  const doc = document as FullscreenDocument
  const native = ref(false)
  const expanded = ref(false)
  const message = ref('')
  const active = computed(() => native.value || expanded.value)
  const current = () => doc.fullscreenElement || doc.webkitFullscreenElement
  let disposed = false

  function sync() {
    native.value = Boolean(host.value && current() === host.value)
    expanded.value = false
    message.value = ''
  }
  async function exit() {
    try {
      if (current() === host.value) {
        if (doc.exitFullscreen) await doc.exitFullscreen()
        else await doc.webkitExitFullscreen?.()
      }
      expanded.value = false
      sync()
    } catch {
      message.value = 'Use the browser’s fullscreen control to exit fullscreen.'
    }
  }
  async function toggle() {
    if (active.value) return exit()
    const element = host.value as FullscreenElement | null
    if (!element) return
    try {
      if (element.requestFullscreen) await element.requestFullscreen()
      else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen()
      else throw new Error('Fullscreen unavailable')
      if (!disposed) sync()
    } catch {
      if (disposed) return
      expanded.value = true
      message.value = 'Showing full-window view. This browser could not hide its toolbar.'
    }
  }
  onMounted(() => {
    doc.addEventListener('fullscreenchange', sync)
    doc.addEventListener('webkitfullscreenchange', sync)
  })
  onBeforeUnmount(() => {
    disposed = true
    doc.removeEventListener('fullscreenchange', sync)
    doc.removeEventListener('webkitfullscreenchange', sync)
  })
  return { active, message, toggle, exit }
}
