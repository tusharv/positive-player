<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { channelByNumber, formatChannelLabel } from '../data/channels'
import WatchIcon from './WatchIcon.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ channelNumber: number; disabled?: boolean }>()
const emit = defineEmits<{ 'open-change': [open: boolean] }>()
const titleId = useId()
const dialog = ref<HTMLDialogElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const linkInput = ref<HTMLInputElement | null>(null)
const message = ref('')
const isOpen = ref(false)
const nativeSharing = typeof navigator.share === 'function'
const channel = computed(() => channelByNumber(props.channelNumber))
const label = computed(() => (channel.value ? formatChannelLabel(channel.value) : 'Channel'))
const url = computed(() => {
  // Build from the player route, never from a remote pairing URL or invitation.
  const link = new URL(`${import.meta.env.BASE_URL}watch`, window.location.origin)
  link.searchParams.set('channel', String(props.channelNumber))
  return link.href
})
const text = computed(() => `Watch ${label.value} on 1988.in`)
const services = computed(() => {
  const link = encodeURIComponent(url.value)
  const caption = encodeURIComponent(text.value)
  return [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${text.value} ${url.value}`)}`,
    },
    { name: 'Twitter / X', href: `https://twitter.com/intent/tweet?text=${caption}&url=${link}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${link}&text=${caption}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    {
      name: 'Email',
      href: `mailto:?subject=${caption}&body=${encodeURIComponent(`${text.value}\n${url.value}`)}`,
    },
  ]
})
watch(
  () => props.channelNumber,
  () => {
    message.value = ''
  },
)
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isOpen.value) dialog.value?.close()
  },
)
function open() {
  message.value = ''
  dialog.value?.showModal()
  isOpen.value = true
  emit('open-change', true)
}
function closed() {
  isOpen.value = false
  emit('open-change', false)
  trigger.value?.focus({ preventScroll: true })
}
async function copy() {
  const link = url.value
  try {
    await navigator.clipboard.writeText(link)
    if (url.value === link) message.value = 'Link copied!'
  } catch {
    message.value = 'Select and copy the link manually below.'
    linkInput.value?.focus()
    linkInput.value?.select()
  }
}
async function shareNative() {
  try {
    await navigator.share({ title: label.value, text: text.value, url: url.value })
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AbortError')) {
      message.value = 'Sharing is unavailable. Choose an option above or copy the link.'
    }
  }
}
</script>

<template>
  <button
    v-bind="$attrs"
    ref="trigger"
    class="share-launch"
    type="button"
    aria-label="Share channel"
    aria-haspopup="dialog"
    :aria-expanded="isOpen"
    :disabled="disabled || !channel"
    @click="open"
  >
    <WatchIcon name="share" /><span>Share</span>
  </button>
  <dialog
    ref="dialog"
    class="share-dialog"
    :aria-labelledby="titleId"
    @close="closed"
    @keydown.stop
    @click="$event.target === dialog && dialog?.close()"
  >
    <div class="share-content">
      <button class="close" type="button" aria-label="Close sharing" @click="dialog?.close()">
        ×
      </button>
      <p class="eyebrow">Pass on something good</p>
      <h2 :id="titleId">Share this channel</h2>
      <p class="channel-name">{{ label }}</p>
      <div class="share-options">
        <a
          v-for="service in services"
          :key="service.name"
          :data-service="service.name"
          :href="service.href"
          :target="service.name === 'Email' ? undefined : '_blank'"
          rel="noopener noreferrer"
        >
          {{ service.name }}<span aria-hidden="true">↗</span>
        </a>
        <button type="button" data-action="copy" @click="copy">
          Copy Link<span aria-hidden="true">⧉</span>
        </button>
        <button v-if="nativeSharing" class="native-share" type="button" @click="shareNative">
          More…
        </button>
      </div>
      <label class="link-label"
        >Channel link
        <input ref="linkInput" :value="url" readonly @focus="linkInput?.select()" />
      </label>
      <p class="feedback" :role="isOpen ? 'status' : undefined">{{ message }}</p>
    </div>
  </dialog>
</template>

<style scoped>
.share-launch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.65rem 1rem;
  border: 1px solid #6b604e;
  border-radius: 8px;
  background: #24221b;
  color: var(--crt-phosphor);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}
.share-launch:disabled {
  opacity: 0.4;
  cursor: default;
}
.share-dialog {
  box-sizing: border-box;
  width: min(440px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  padding: 0;
  border: 1px solid #6c604c;
  border-radius: 18px;
  background: #17140f;
  color: var(--crt-cream);
  box-shadow: 0 24px 100px #000b;
  text-align: left;
}
.share-dialog::backdrop {
  background: #000b;
}
.share-content {
  padding: 2rem 1.5rem 1rem;
}
.close {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 40px;
  height: 40px;
  border: 0;
  background: none;
  color: var(--crt-cream);
  font-size: 1.6rem;
  cursor: pointer;
}
.eyebrow {
  color: var(--crt-phosphor);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
}
.channel-name {
  font-size: 0.8rem;
  color: #b7af9f;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.share-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 1.25rem 0;
}
.share-options a,
.share-options button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 48px;
  box-sizing: border-box;
  padding: 0.75rem;
  border: 1px solid #53604a;
  border-radius: 6px;
  background: #101b12;
  color: var(--crt-phosphor);
  font: inherit;
  font-size: 0.75rem;
  text-decoration: none;
  cursor: pointer;
}
.share-options a:hover,
.share-options button:hover {
  background: #24452c;
}
.share-options .native-share {
  grid-column: 1 / -1;
  justify-content: center;
}
.link-label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.65rem;
  color: #b7af9f;
}
input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid #6c604c;
  border-radius: 6px;
  background: #080605;
  color: var(--crt-cream);
  font: inherit;
  font-size: 0.75rem;
}
.feedback {
  min-height: 2.5em;
  margin-bottom: 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--crt-phosphor);
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 3px;
}
</style>
