<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import RemoteIcon from '../components/RemoteIcon.vue'
import { CHANNELS, CHANNEL_COUNT, CHANNEL_DIGITS, formatChannelNumber } from '../data/channels'
import { RemoteConnection, remoteErrors, type ConnectionStatus } from '../lib/remoteConnection'
import { isSnapshot, type RemoteCommand, type TvSnapshot } from '../lib/remoteProtocol'

const status = ref<ConnectionStatus>('idle')
const paired = ref(false)
const hostOnline = ref(false)
const state = ref<TvSnapshot | null>(null)
const code = ref('')
const error = ref('')
const channel = computed(() => CHANNELS.find((item) => item.number === state.value?.channelNumber))
const canControl = computed(
  () => status.value === 'connected' && hostOnline.value && state.value !== null,
)
const enabled = computed(
  () => status.value === 'connected' && hostOnline.value && state.value?.poweredOn === true,
)
const connectionLabel = computed(() => {
  if (status.value !== 'connected') return 'Reconnecting…'
  if (!hostOnline.value) return 'Waiting for the TV…'
  if (!state.value?.poweredOn) return 'TV is off · Press Power to turn on'
  return 'Connected to your TV'
})
const connection = new RemoteConnection('remote', {
  status: (next) => {
    status.value = next
    if (next !== 'connected') hostOnline.value = false
  },
  message: (message) => {
    if (message.type === 'session') {
      paired.value = true
      error.value = ''
      // The one-time invitation is no longer useful once the phone has its own credential.
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      )
    }
    if (message.type === 'presence') hostOnline.value = message.hostOnline === true
    if (message.type === 'state' && isSnapshot(message.state)) {
      state.value = message.state
      error.value = ''
    }
    if (message.type === 'ended') {
      paired.value = false
      state.value = null
      error.value = 'The remote connection has ended. Enter a new code to pair again.'
    }
    if (message.type === 'error') {
      error.value =
        remoteErrors[String(message.code)] ?? 'That didn’t go through. Please try again.'
      if (status.value === 'idle') {
        paired.value = false
        state.value = null
      }
    }
  },
})
function join() {
  error.value = ''
  connection.start({ type: 'join', code: code.value.trim() })
}
function command(value: RemoteCommand) {
  if (!canControl.value || (!enabled.value && value.action !== 'powerToggle')) return
  error.value = ''
  if (!connection.send({ type: 'command', command: value }))
    error.value = 'Connection interrupted. Try again when the TV reconnects.'
}
function disconnect() {
  connection.end()
  paired.value = false
  state.value = null
  code.value = ''
  error.value = ''
}
onMounted(() => {
  const invite = new URLSearchParams(window.location.hash.slice(1)).get('invite')
  if (invite) connection.start({ type: 'join', invite })
  else if (connection.canResume) {
    paired.value = true
    connection.start()
  }
})
onBeforeUnmount(() => connection.destroy())
</script>

<template>
  <main class="remote-page">
    <div class="handset">
      <header>
        <RouterLink to="/" class="brand">Positive Player</RouterLink>
        <span class="device-label">Remote / 01</span>
      </header>
      <template v-if="!paired">
        <div class="pair-intro">
          <span class="signal-mark" aria-hidden="true">(( · ))</span>
          <h1>Take the controls.</h1>
          <p>
            On your TV, choose <strong>Connect remote</strong>.<br />Scan its QR code or enter the
            code below.
          </p>
        </div>
        <form @submit.prevent="join">
          <label for="pair-code">TV pairing code</label>
          <input
            id="pair-code"
            v-model="code"
            name="code"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            placeholder="ABCD EFGH"
            maxlength="9"
            pattern="[A-Za-z2-9\s-]{8,9}"
            required
            :disabled="status !== 'idle'"
          />
          <button class="connect-button" type="submit" :disabled="status !== 'idle'">
            {{ status === 'idle' ? 'Connect to TV' : 'Connecting…' }}
          </button>
        </form>
        <p v-if="status !== 'idle'" class="help" role="status">
          Keep the TV open. If connecting takes a while, check that both devices can reach the site.
        </p>
        <button v-if="status !== 'idle'" class="quiet-button" type="button" @click="disconnect">
          Cancel connection
        </button>
        <p class="help">Your video stays on the big screen.</p>
      </template>
      <template v-else>
        <button
          class="power-button"
          type="button"
          :aria-label="state?.poweredOn ? 'Turn off TV' : 'Turn on TV'"
          :aria-pressed="state?.poweredOn ?? false"
          :disabled="!canControl"
          @click="command({ action: 'powerToggle' })"
        >
          <RemoteIcon name="power" /> Power
        </button>
        <section class="display" aria-label="TV status">
          <p class="status" role="status">
            <span class="dot" :class="{ online: enabled }" />{{ connectionLabel }}
          </p>
          <p class="channel-number">
            CH
            <span>{{
              state?.channelNumber != null ? formatChannelNumber(state.channelNumber) : '—'
            }}</span>
          </p>
          <h1>{{ channel?.name ?? 'Your TV' }}</h1>
          <p v-if="channel?.blurb" class="blurb">{{ channel.blurb }}</p>
          <div class="volume-readout">
            <span>{{ state?.muted ? 'Muted' : `Volume ${state?.volume ?? '—'}` }}</span>
            <div class="volume-meter" aria-hidden="true">
              <i :style="{ width: `${state?.muted ? 0 : (state?.volume ?? 0)}%` }" />
            </div>
          </div>
          <p
            v-if="state?.interruption !== 'none' && state?.poweredOn && hostOnline"
            class="interruption"
          >
            Signal interrupted · Try another channel
          </p>
        </section>
        <fieldset :disabled="!enabled" class="controls" aria-label="TV controls">
          <div class="rockers">
            <div class="rocker">
              <button
                type="button"
                aria-label="Next channel"
                @click="command({ action: 'channelStep', value: 1 })"
              >
                <RemoteIcon name="plus" />
              </button>
              <span><RemoteIcon name="tv" /> Channel</span>
              <button
                type="button"
                aria-label="Previous channel"
                @click="command({ action: 'channelStep', value: -1 })"
              >
                <RemoteIcon name="minus" />
              </button>
            </div>
            <div class="rocker">
              <button
                type="button"
                aria-label="Volume up"
                @click="command({ action: 'volumeStep', value: 5 })"
              >
                <RemoteIcon name="plus" />
              </button>
              <span><RemoteIcon name="volume" /> Volume</span>
              <button
                type="button"
                aria-label="Volume down"
                @click="command({ action: 'volumeStep', value: -5 })"
              >
                <RemoteIcon name="minus" />
              </button>
            </div>
          </div>
          <button
            class="mute-button"
            type="button"
            :aria-pressed="state?.muted ?? false"
            @click="command({ action: 'mute' })"
          >
            <RemoteIcon :name="state?.muted ? 'volume' : 'mute'" />
            {{ state?.muted ? 'Unmute sound' : 'Mute sound' }}
          </button>
          <div class="keypad" aria-label="Channel number pad">
            <button
              v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
              :key="digit"
              type="button"
              :aria-label="`Digit ${digit}`"
              @click="command({ action: 'digit', value: digit })"
            >
              {{ digit }}
            </button>
            <span class="key-hint"
              >{{ '1'.padStart(CHANNEL_DIGITS, '0') }}—{{ CHANNEL_COUNT }}</span
            >
            <button
              type="button"
              aria-label="Digit 0"
              @click="command({ action: 'digit', value: '0' })"
            >
              0
            </button>
            <span class="key-hint">Channels</span>
          </div>
        </fieldset>
        <p class="help">
          Enter {{ '1'.padStart(CHANNEL_DIGITS, '0') }}–{{ formatChannelNumber(CHANNEL_COUNT) }}, or
          tap a number and wait a moment.
        </p>
        <button class="quiet-button" type="button" @click="disconnect">Disconnect from TV</button>
      </template>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <footer>
        Good things. One channel at a time.
        <nav class="legal-links" aria-label="Legal">
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
            >YouTube Terms of Service</a
          >
        </nav>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.power-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 20px auto;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid #b86758;
  border-radius: 24px;
  background: #5d2824;
  color: #ffe2d9;
}
.power-button:disabled {
  opacity: 0.4;
}
.power-button[aria-pressed='true'] {
  border-color: var(--crt-phosphor);
}
.rocker button,
.rocker span,
.mute-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.rocker span :deep(svg) {
  width: 14px;
  height: 14px;
}

.remote-page {
  min-height: 100dvh;
  box-sizing: border-box;
  padding: max(20px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(20px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  background: radial-gradient(ellipse at 50% 0, #342b20, #080605 75%);
}
.handset {
  box-sizing: border-box;
  max-width: 380px;
  margin: 0 auto;
  padding: 22px;
  border: 1px solid #524738;
  border-radius: 28px;
  background: linear-gradient(155deg, #29251e, #16130f 60%);
  box-shadow:
    inset 0 1px 0 #ffffff12,
    0 16px 48px #0006;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.brand {
  color: #e1d7c5;
  font-size: 0.75rem;
  text-decoration: none;
}
.device-label {
  color: #b0a38f;
  text-transform: uppercase;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
}
.pair-intro {
  padding: 24px 0 20px;
}
.signal-mark {
  font-size: 1.8rem;
  color: var(--crt-phosphor);
}
h1 {
  font-size: 1.4rem;
  font-weight: 500;
  margin: 12px 0;
}
.pair-intro p,
.help {
  color: #c0b5a2;
  font-size: 0.72rem;
  line-height: 1.7;
}
form {
  display: grid;
  gap: 12px;
}
label {
  color: #c0b5a2;
  font-size: 0.7rem;
}
input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  border: 1px solid #75644b;
  border-radius: 8px;
  background: #0b100b;
  color: var(--crt-phosphor);
  padding: 16px 12px;
  font: inherit;
  font-size: 1.35rem;
  letter-spacing: 0.13em;
  text-align: center;
  text-transform: uppercase;
}
button {
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 3px;
}
button:disabled {
  cursor: default;
}
.connect-button {
  border: 0;
  border-radius: 8px;
  padding: 16px;
  background: var(--crt-phosphor);
  color: #111b12;
}
.connect-button:disabled {
  opacity: 0.5;
}
.display {
  border: 1px solid #53604a;
  border-radius: 12px;
  background: repeating-linear-gradient(to bottom, #0002 0 1px, transparent 1px 3px), #101b12;
  padding: 18px;
  color: var(--crt-phosphor);
  box-shadow: inset 0 2px 12px #0007;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.62rem;
  line-height: 1.5;
  margin: 0 0 16px;
}
.dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9c937b;
}
.dot.online {
  background: var(--crt-phosphor);
  box-shadow: 0 0 8px #8fd9a466;
}
.channel-number {
  font-size: 0.9rem;
  margin: 0;
}
.channel-number span {
  font-size: 2.7rem;
  letter-spacing: -0.08em;
}
.display h1 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 1rem;
}
.blurb {
  margin: 0 0 20px;
  color: #b7c9b4;
  font-size: 0.68rem;
  line-height: 1.5;
  letter-spacing: 0.02em;
}
.volume-readout {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.65rem;
}
.volume-meter {
  flex: 1;
  height: 5px;
  background: #8fd9a422;
}
.volume-meter i {
  display: block;
  height: 100%;
  background: var(--crt-phosphor);
  transition: width 0.15s;
}
.interruption {
  font-size: 0.62rem;
  line-height: 1.6;
  margin: 12px 0 0;
  color: #e1c28a;
}
.controls {
  border: 0;
  padding: 0;
  margin: 24px 0 0;
  min-width: 0;
}
.controls:disabled {
  opacity: 0.4;
}
.rockers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.rocker {
  display: grid;
  grid-template-rows: 54px 24px 54px;
  background: #343028;
  border: 1px solid #6b604e;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 3px 0 #080605;
  text-align: center;
}
.rocker button {
  border: 0;
  background: transparent;
  color: var(--crt-cream);
  font-size: 1.7rem;
}
.rocker span {
  align-self: center;
  color: #c8baa4;
  text-transform: uppercase;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
}
.mute-button {
  width: 100%;
  margin: 18px 0;
  min-height: 44px;
  border: 1px solid #6b604e;
  border-radius: 20px;
  background: #24221b;
  color: #e3d7c3;
  font-size: 0.75rem;
}
.mute-button[aria-pressed='true'] {
  border-color: var(--crt-phosphor);
  color: var(--crt-phosphor);
}
.keypad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.keypad button {
  min-height: 48px;
  border: 1px solid #554d40;
  border-radius: 12px;
  background: linear-gradient(#302b23, #242019);
  color: var(--crt-cream);
  font-size: 1.1rem;
  box-shadow: 0 2px 0 #080605;
}
button:active:not(:disabled) {
  transform: translateY(1px);
  filter: brightness(1.2);
}
.key-hint {
  align-self: center;
  text-align: center;
  font-size: 0.56rem;
  color: #b0a38f;
}
.help {
  text-align: center;
  margin: 16px 0;
  font-size: 0.65rem;
}
.quiet-button {
  display: block;
  margin: 0 auto;
  min-height: 44px;
  padding: 8px;
  background: none;
  border: 0;
  color: #c0b5a2;
  text-decoration: underline;
  font-size: 0.65rem;
}
.error {
  padding: 12px;
  border: 1px solid #ae8460;
  color: #f1caa2;
  border-radius: 8px;
  font-size: 0.72rem;
  line-height: 1.6;
}
footer {
  margin-top: 24px;
  text-align: center;
  color: #b0a38f;
  font-size: 0.54rem;
  line-height: 1.5;
}
.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 14px;
  margin-top: 10px;
}
.legal-links a {
  color: #c0b5a2;
}
@media (max-width: 360px) {
  .handset {
    padding: 16px;
  }
  .device-label {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .volume-meter i {
    transition: none;
  }
}
</style>
