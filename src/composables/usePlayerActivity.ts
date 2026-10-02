import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

export function usePlayerActivity(poweredOn: Ref<boolean>, pinned: Ref<boolean>) {
  const visible = ref(true)
  let timer = 0
  function reveal() {
    window.clearTimeout(timer)
    visible.value = true
    if (!poweredOn.value || pinned.value) return
    timer = window.setTimeout(() => {
      visible.value = false
    }, 4000)
  }
  watch([poweredOn, pinned], reveal, { immediate: true })
  onBeforeUnmount(() => window.clearTimeout(timer))
  return { visible, reveal }
}
