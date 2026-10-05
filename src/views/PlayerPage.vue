<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerActivity } from '../composables/usePlayerActivity'
import { usePlayerFullscreen } from '../composables/usePlayerFullscreen'
import WatchIcon from '../components/WatchIcon.vue'
import ChannelTuning from '../components/ChannelTuning.vue'
import ChannelGuide from '../components/ChannelGuide.vue'
import ChannelHud from '../components/ChannelHud.vue'
import ChannelZap from '../components/ChannelZap.vue'
import CrtShell from '../components/CrtShell.vue'
import InterruptionCard from '../components/InterruptionCard.vue'
import PowerGate from '../components/PowerGate.vue'
import RemotePairing from '../components/RemotePairing.vue'
import YoutubeStage from '../components/YoutubeStage.vue'
import { hasLegalConsent } from '../lib/legalConsent'
import { useTvStore } from '../stores/tv'

const tv = useTvStore()
const page = ref<HTMLElement | null>(null)
const controls = ref<HTMLElement | null>(null)
const fullscreen = usePlayerFullscreen(page)
const guideOpen = ref(false)
const pairingOpen = ref(false)
const pinned = computed(() => guideOpen.value || pairingOpen.value)
const { poweredOn } = storeToRefs(tv)
const { visible: hudVisible, reveal } = usePlayerActivity(poweredOn, pinned)
let lastControl: HTMLElement | null = null
let digitTicker = 0

watch(
  hudVisible,
  (visible) => {
    if (
      !visible &&
      document.activeElement instanceof HTMLElement &&
      controls.value?.contains(document.activeElement)
    ) {
      lastControl = document.activeElement
      page.value?.focus({ preventScroll: true })
    }
  },
  { flush: 'sync' },
)

watch(
  () => [
    tv.channelNumber,
    tv.volume.volume,
    tv.volume.muted,
    tv.pendingDigits,
    fullscreen.active.value,
  ],
  reveal,
)

function pointerActivity(event: PointerEvent) {
  // Touch movement can be scrolling; a tap on the wake surface reveals controls.
  if (event.pointerType !== 'touch') reveal()
}
function wakeOnKey(event: KeyboardEvent) {
  if (!tv.poweredOn || event.altKey || event.ctrlKey || event.metaKey) return
  const hidden = !hudVisible.value
  reveal()
  if (!hidden) return
  if (event.key === 'Enter' || event.key === ' ' || event.key.startsWith('Arrow')) {
    event.preventDefault()
    event.stopImmediatePropagation()
    void nextTick(() => {
      const target = lastControl?.isConnected
        ? lastControl
        : controls.value?.querySelector<HTMLButtonElement>('[aria-label="Next channel"]')
      target?.focus({ preventScroll: true })
    })
  }
}

watch(
  () => tv.poweredOn,
  async (on) => {
    if (!on) guideOpen.value = false
    if (on) {
      await nextTick()
      controls.value
        ?.querySelector<HTMLButtonElement>('[aria-label="Next channel"]')
        ?.focus({ preventScroll: true })
    }
  },
)

function navigateControls(event: KeyboardEvent) {
  const target = event.target
  if (!(target instanceof HTMLButtonElement) || target.closest('.guide, dialog')) return
  if (event.key === 'Enter') {
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat) target.click()
    return
  }
  const direction = ['ArrowRight', 'ArrowDown'].includes(event.key)
    ? 1
    : ['ArrowLeft', 'ArrowUp'].includes(event.key)
      ? -1
      : 0
  if (!direction) return
  const buttons = Array.from(
    controls.value?.querySelectorAll<HTMLButtonElement>('button') ?? [],
  ).filter((button) => !button.disabled && !button.closest('.guide, dialog'))
  const index = buttons.indexOf(target)
  if (index < 0) return
  event.preventDefault()
  event.stopPropagation()
  buttons[(index + direction + buttons.length) % buttons.length]?.focus({ preventScroll: true })
}

function onKey(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (
    (event.key === 'Escape' || event.key === 'GoBack' || event.keyCode === 10009) &&
    fullscreen.active.value
  ) {
    event.preventDefault()
    void fullscreen.exit()
    return
  }
  if (
    event.target instanceof HTMLElement &&
    event.target.closest('input, textarea, select, dialog, [contenteditable="true"]')
  )
    return
  if (
    event.target instanceof HTMLElement &&
    event.target.closest('button, a') &&
    (event.key.startsWith('Arrow') || event.key === 'Enter' || event.key === ' ')
  )
    return
  if (!tv.poweredOn) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (hasLegalConsent()) tv.powerOn()
    }
    return
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
    event.preventDefault()
    tv.channelStep(1)
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
    event.preventDefault()
    tv.channelStep(-1)
    return
  }
  if (/^[0-9]$/.test(event.key)) {
    tv.typeDigit(event.key)
    return
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    tv.volumeStep(5)
    return
  }
  if (event.key === '-' || event.key === '_') {
    event.preventDefault()
    tv.volumeStep(-5)
    return
  }
  if (event.key === 'm' || event.key === 'M') {
    tv.muteToggle()
  }
}

onMounted(() => {
  window.addEventListener('keydown', wakeOnKey, true)
  window.addEventListener('keydown', onKey)
  digitTicker = window.setInterval(() => tv.tickDigits(), 200)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', wakeOnKey, true)
  window.removeEventListener('keydown', onKey)
  window.clearInterval(digitTicker)
})
</script>

<template>
  <main
    ref="page"
    class="page"
    tabindex="-1"
    :class="{ 'page--idle': tv.poweredOn && !hudVisible }"
    @pointermove="pointerActivity"
    @pointerdown="hudVisible && reveal()"
    @click="reveal"
    @focusin="hudVisible && reveal()"
    @wheel.passive="reveal"
  >
    <CrtShell :expanded="fullscreen.active.value">
      <YoutubeStage
        v-if="tv.poweredOn"
        v-show="tv.currentSlot"
        :video-id="tv.currentSlot?.videoId ?? null"
        :start-seconds="tv.currentSlot?.startSeconds ?? 0"
        :playback-revision="tv.playbackRevision"
        :volume="tv.volume.volume"
        :muted="tv.volume.muted"
        @ended="tv.onPlayerEnded()"
        @error="tv.onPlayerError"
        @playing="tv.onPlayerPlaying"
        @script-error="tv.onScriptError()"
      />
      <ChannelZap v-if="tv.waitingForPlayback" />
      <ChannelTuning v-if="tv.waitingForPlayback" :label="tv.channelLabel" />
      <InterruptionCard
        v-if="tv.poweredOn && tv.interruption !== 'none'"
        :channel-number="tv.interruptionChannelNumber"
      />
      <ChannelHud
        v-if="tv.poweredOn"
        :label="tv.channelLabel"
        :pending-digits="tv.pendingDigits"
        :volume="tv.volume.volume"
        :muted="tv.volume.muted"
        :visible="hudVisible"
        :volume-visible="tv.volumeVisible && hudVisible"
      />
      <button
        v-if="tv.poweredOn && !hudVisible"
        class="wake-controls"
        type="button"
        aria-label="Show player controls"
        @click.stop="reveal"
        @focus="reveal"
      />
      <div
        v-show="tv.poweredOn"
        ref="controls"
        class="player-controls"
        :class="{ 'player-controls--hidden': !hudVisible }"
        :aria-hidden="!hudVisible"
        :inert="!hudVisible ? true : undefined"
        @keydown="navigateControls"
      >
        <div class="control-row" role="group" aria-label="TV controls">
          <template v-if="tv.poweredOn">
            <button type="button" aria-label="Previous channel" @click="tv.channelStep(-1)">
              <WatchIcon name="channel-down" /><span>CH −</span>
            </button>
            <button type="button" aria-label="Next channel" @click="tv.channelStep(1)">
              <WatchIcon name="channel-up" /><span>CH +</span>
            </button>
            <ChannelGuide
              :current-channel="tv.channelNumber"
              @tune="tv.setChannel"
              @open-change="guideOpen = $event"
            />
            <button type="button" aria-label="Volume down" @click="tv.volumeStep(-5)">
              <WatchIcon name="volume-down" /><span>VOL −</span>
            </button>
            <button type="button" aria-label="Volume up" @click="tv.volumeStep(5)">
              <WatchIcon name="volume-up" /><span>VOL +</span>
            </button>
            <button
              type="button"
              :aria-label="tv.volume.muted ? 'Unmute' : 'Mute'"
              :aria-pressed="tv.volume.muted"
              @click="tv.muteToggle()"
            >
              <WatchIcon :name="tv.volume.muted ? 'mute' : 'sound'" />
              <span>{{ tv.volume.muted ? 'Unmute' : 'Mute' }}</span>
            </button>
          </template>
          <button
            type="button"
            :aria-label="fullscreen.active.value ? 'Exit fullscreen' : 'Enter fullscreen'"
            :aria-pressed="fullscreen.active.value"
            @click="fullscreen.toggle"
          >
            <WatchIcon :name="fullscreen.active.value ? 'restore' : 'fullscreen'" />
            <span>{{ fullscreen.active.value ? 'Exit fullscreen' : 'Fullscreen' }}</span>
          </button>
          <RemotePairing @open-change="pairingOpen = $event" />
        </div>
        <p v-if="fullscreen.message.value" class="fullscreen-message" role="status">
          {{ fullscreen.message.value }}
        </p>
      </div>
      <PowerGate v-if="!tv.poweredOn" @power="tv.powerOn()" />
    </CrtShell>
  </main>
</template>

<style scoped>
.page {
  min-height: 100dvh;
}
.page:focus {
  outline: none;
}
.page--idle {
  cursor: none;
}
.wake-controls {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: none;
}
.player-controls {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
    max(1.75rem, calc(env(safe-area-inset-bottom) + 0.75rem)) max(1rem, env(safe-area-inset-left));
  box-sizing: border-box;
  pointer-events: none;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition:
    opacity 200ms ease,
    transform 200ms ease,
    visibility 0s;
}
.player-controls--hidden {
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition:
    opacity 200ms ease,
    transform 200ms ease,
    visibility 0s 200ms;
}
.player-controls.player-controls--hidden :deep(button) {
  pointer-events: none;
}
.control-row {
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  align-self: center;
  max-width: 100%;
  padding: 0.65rem;
  border: 1px solid #55594e;
  border-radius: 9px;
  background: linear-gradient(#30332e, #171c18);
  box-shadow:
    inset 0 1px #777a68,
    0 4px 0 #090d0a,
    0 8px 24px #0009;
}
.control-row > button,
.control-row :deep(.guide-launch),
.control-row :deep(.remote-launch) {
  position: relative;
  inset: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 66px;
  min-width: 44px;
  padding: 0.45rem 0.65rem;
  border: 1px solid #4c6150;
  border-bottom-color: #080c09;
  border-radius: 4px;
  background: linear-gradient(#26352b, #101b14);
  box-shadow:
    inset 0 1px #81917b55,
    inset 1px 0 #81917b22,
    0 3px 0 #070b08;
  color: var(--crt-phosphor);
  font: inherit;
  font-size: clamp(0.6rem, 0.85vw, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  pointer-events: auto;
}
.control-row :deep(.watch-icon) {
  flex-shrink: 0;
  filter: drop-shadow(0 0 3px #8fd9a455);
}
.control-row > button:hover,
.control-row :deep(.guide-launch:hover),
.control-row :deep(.remote-launch:hover) {
  color: #c6ffd1;
  background: linear-gradient(#354e3a, #192b1e);
}
.control-row > button:active,
.control-row :deep(.guide-launch:active),
.control-row :deep(.remote-launch:active) {
  transform: translateY(2px);
  box-shadow: inset 0 2px 4px #0009;
}
.control-row > button[aria-pressed='true'] {
  color: #f0c779;
  border-color: #9a7942;
}
.control-row :deep(.connection-dot) {
  position: absolute;
  top: 7px;
  right: 7px;
}
@media (max-width: 480px) {
  .control-row {
    gap: 0.35rem;
    padding: 0.45rem;
  }
  .control-row > button,
  .control-row :deep(.guide-launch),
  .control-row :deep(.remote-launch) {
    flex: 1 0 19%;
    min-height: 60px;
    padding: 0.35rem;
  }
}
.control-row :deep(button:focus-visible) {
  outline: 3px solid var(--crt-cream);
  outline-offset: 3px;
  background: #24452c;
}
.control-row :deep(.guide),
.control-row :deep(dialog) {
  pointer-events: auto;
}
.fullscreen-message {
  align-self: center;
  margin: 0.7rem 0 0;
  padding: 0.5rem 0.75rem;
  background: #08110b;
  font-size: 0.8rem;
}
@media (prefers-reduced-motion: reduce) {
  .player-controls,
  .control-row {
    transition: none;
  }
  .player-controls--hidden {
    transform: none;
  }
}
</style>
