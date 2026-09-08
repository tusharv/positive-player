<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { useTvRemote } from '../composables/useTvRemote'

const remote = useTvRemote()
const dialog = ref<HTMLDialogElement | null>(null)
const qr = ref('')
const now = ref(Date.now())
const timer = window.setInterval(() => {
  now.value = Date.now()
}, 1000)
onBeforeUnmount(() => window.clearInterval(timer))
const remaining = computed(() =>
  Math.max(0, Math.ceil((remote.expiresAt.value - now.value) / 1000)),
)
const expired = computed(() => Boolean(remote.code.value) && remaining.value === 0)
const remoteUrl = new URL(`${import.meta.env.BASE_URL}remote`, window.location.origin)
const localOnly = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
const pairUrl = computed(() => {
  const url = new URL(remoteUrl)
  url.hash = new URLSearchParams({ invite: remote.invite.value }).toString()
  return url.href
})
watch(
  pairUrl,
  async (url, _, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    qr.value = ''
    if (!remote.invite.value) return
    try {
      const data = await QRCode.toDataURL(url, { width: 256, margin: 2, errorCorrectionLevel: 'M' })
      if (!cancelled) qr.value = data
    } catch {
      /* The short code remains available if canvas is unavailable. */
    }
  },
  { immediate: true },
)
function open() {
  dialog.value?.showModal()
  if (remote.status.value === 'idle' && !remote.paired.value) remote.connect()
}
</script>

<template>
  <button class="remote-launch" type="button" @click="open">
    <span
      class="connection-dot"
      :class="{ online: remote.remoteOnline.value }"
      aria-hidden="true"
    />
    {{ remote.paired.value ? 'Phone remote' : 'Connect remote' }}
  </button>
  <dialog ref="dialog" class="pair-dialog" aria-labelledby="pair-title" @keydown.stop>
    <button class="close" type="button" aria-label="Close pairing" @click="dialog?.close()">
      ×
    </button>
    <p class="eyebrow">Positive Player · Remote</p>
    <h1 id="pair-title">Your phone. Your remote.</h1>
    <template v-if="remote.paired.value">
      <p role="status">
        {{
          remote.remoteOnline.value
            ? 'Your phone is connected.'
            : 'Waiting for your phone to reconnect…'
        }}
      </p>
      <p class="note">Change channels and sound from your phone. Keep this TV tab open.</p>
      <button class="action" type="button" @click="remote.disconnect">Disconnect remote</button>
    </template>
    <template v-else-if="remote.code.value && !expired">
      <p>Scan with your phone’s camera.</p>
      <a
        v-if="qr && !localOnly"
        :href="pairUrl"
        target="_blank"
        rel="noopener"
        aria-label="Open phone pairing link"
      >
        <img
          :src="qr"
          alt="Scan to pair your phone with this TV"
          width="224"
          height="224"
          class="qr"
        />
      </a>
      <p v-if="localOnly" class="note local-note">
        For phone pairing, open this TV using your computer’s Wi-Fi address instead of localhost.
        Both devices need to reach the same site.
      </p>
      <p class="note">
        Or open
        <a :href="remoteUrl.href" target="_blank" rel="noopener">{{ remoteUrl.host }}/remote</a> and
        enter:
      </p>
      <p class="pair-code" aria-label="Pairing code">
        {{ remote.code.value.slice(0, 4) }} {{ remote.code.value.slice(4) }}
      </p>
      <p class="note">
        Expires in {{ Math.floor(remaining / 60) }}:{{ String(remaining % 60).padStart(2, '0') }} ·
        One phone per TV
      </p>
      <button class="text-action" type="button" @click="remote.disconnect">Cancel pairing</button>
    </template>
    <template v-else-if="expired">
      <p>This pairing code has expired.</p>
      <button class="action" type="button" @click="remote.connect">Get a new code</button>
    </template>
    <template
      v-else-if="remote.status.value === 'connecting' || remote.status.value === 'reconnecting'"
    >
      <p role="status">Connecting to the remote service…</p>
      <p class="note">
        If this takes a while, check your connection and that the TV server is running.
      </p>
      <button class="text-action" type="button" @click="remote.disconnect">Cancel</button>
    </template>
    <template v-else>
      <p role="status">{{ remote.error.value || 'Connect your phone to control this TV.' }}</p>
      <button class="action" type="button" @click="remote.connect">Connect a phone</button>
    </template>
  </dialog>
</template>

<style scoped>
.remote-launch {
  position: absolute;
  right: 1.25rem;
  bottom: 1.1rem;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid #8fd9a444;
  border-radius: 5px;
  background: #080605db;
  color: var(--crt-phosphor);
  font-size: 0.65rem;
  cursor: pointer;
}
.connection-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #777;
}
.connection-dot.online {
  background: var(--crt-phosphor);
  box-shadow: 0 0 6px var(--crt-phosphor);
}
.pair-dialog {
  box-sizing: border-box;
  width: min(440px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  padding: 2rem 1.5rem;
  border: 1px solid #6c604c;
  border-radius: 18px;
  background: #17140f;
  color: var(--crt-cream);
  text-align: center;
  box-shadow: 0 24px 100px #000b;
}
.pair-dialog::backdrop {
  background: #000b;
}
.close {
  position: absolute;
  right: 8px;
  top: 6px;
  border: 0;
  background: none;
  color: #f3ead4;
  font-size: 1.6rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
}
.eyebrow {
  color: var(--crt-phosphor);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.65rem;
  margin: 0 0 1.25rem;
}
h1 {
  font-size: 1.25rem;
  font-weight: 500;
}
p {
  font-size: 0.82rem;
  line-height: 1.65;
}
.note {
  color: #b7af9f;
  font-size: 0.72rem;
  overflow-wrap: anywhere;
}
.local-note {
  border: 1px solid #6c604c;
  padding: 0.8rem;
  border-radius: 8px;
}
a {
  color: var(--crt-phosphor);
}
.qr {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1rem auto;
  border-radius: 8px;
}
.pair-code {
  color: var(--crt-phosphor);
  font-size: 1.8rem;
  letter-spacing: 0.12em;
  margin: 0.5rem 0;
}
.action {
  width: 100%;
  padding: 0.9rem;
  border: 0;
  border-radius: 8px;
  color: #101810;
  background: var(--crt-phosphor);
  cursor: pointer;
}
.text-action {
  border: 0;
  padding: 0.7rem;
  color: #b7af9f;
  background: none;
  cursor: pointer;
  text-decoration: underline;
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 3px;
}
</style>
