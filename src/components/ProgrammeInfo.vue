<script setup lang="ts">
import { ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import type { CatalogItem } from '../lib/broadcastClock'
import { programmeDuration } from '../lib/programmeSchedule'
import WatchIcon from './WatchIcon.vue'

defineOptions({ inheritAttrs: false })
defineProps<{ programme: CatalogItem | null; channelNumber: number; channelLabel: string }>()
const emit = defineEmits<{ 'open-change': [open: boolean] }>()
const titleId = useId()
const dialog = ref<HTMLDialogElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const opened = ref(false)
function open() {
  dialog.value?.showModal()
  opened.value = true
  emit('open-change', true)
}
function closed() {
  opened.value = false
  emit('open-change', false)
  trigger.value?.focus()
}
</script>

<template>
  <button
    ref="trigger"
    v-bind="$attrs"
    type="button"
    class="info-launch"
    aria-label="Programme information"
    aria-haspopup="dialog"
    :aria-expanded="opened"
    @click="open"
  >
    <WatchIcon name="info" /><span>Info</span>
  </button>
  <dialog
    ref="dialog"
    class="programme-info"
    :aria-labelledby="titleId"
    @close="closed"
    @keydown.stop
    @click="$event.target === dialog && dialog?.close()"
  >
    <header>
      <p>On this channel</p>
      <button type="button" aria-label="Close programme information" @click="dialog?.close()">
        ×
      </button>
    </header>
    <p class="channel">{{ channelLabel }}</p>
    <h2 :id="titleId">
      {{
        programme?.title || (programme ? 'Untitled programme' : 'Programme information unavailable')
      }}
    </h2>
    <p v-if="programme" class="duration">
      {{ programmeDuration(programme.durationSeconds) }} · Full programme
    </p>
    <RouterLink v-if="opened" :to="{ path: '/guide', query: { channel: String(channelNumber) } }"
      >View the next 24 hours <span aria-hidden="true">→</span></RouterLink
    >
  </dialog>
</template>

<style scoped>
.programme-info {
  box-sizing: border-box;
  width: min(460px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  padding: 1.5rem;
  border: 1px solid #68816a;
  border-radius: 12px;
  background: #111c15;
  color: var(--crt-cream);
  box-shadow: 0 16px 80px #0009;
  overflow: auto;
}
.programme-info::backdrop {
  background: #0007;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
header p,
.channel {
  color: var(--crt-phosphor);
  font-size: 0.75rem;
}
header p {
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
header button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #536858;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1.5rem;
  cursor: pointer;
}
h2 {
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.duration {
  color: #b0baaa;
  font-size: 0.8rem;
}
a {
  display: block;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #425344;
  color: var(--crt-phosphor);
  line-height: 1.7;
}
:focus-visible {
  outline: 3px solid var(--crt-cream);
  outline-offset: 3px;
}
</style>
