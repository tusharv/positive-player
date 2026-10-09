<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { channelByNumber } from '../data/channels'
import ChannelShare from '../components/ChannelShare.vue'
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
import { grantLegalConsent } from '../lib/legalConsent'
import { useTvStore } from '../stores/tv'

const tv = useTvStore()
const route = useRoute()
watch(
  () => route?.query.channel,
  (value) => {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return
    const number = Number(value)
    if (!channelByNumber(number)) return
    if (tv.poweredOn) tv.setChannel(number)
    else tv.channelNumber = number
  },
  { immediate: true },
)
const page = ref<HTMLElement | null>(null)
const controls = ref<HTMLElement | null>(null)
const fullscreen = usePlayerFullscreen(page)
const guideOpen = ref(false)
const pairingOpen = ref(false)
const shareOpen = ref(false)
const pinned = computed(() => guideOpen.value || pairingOpen.value || shareOpen.value)
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
    if (!on) {
      guideOpen.value = false
      shareOpen.value = false
    }
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
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing)
    return
  if (pinned.value) return
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
      grantLegalConsent()
      tv.powerOn()
    }
    return
  }

  const key = event.key.toLowerCase()
  const shortcutTargets: Record<string, string> = {
    '[': '[aria-label="Previous channel"]',
    ']': '[aria-label="Next channel"]',
    c: '.guide-launch',
    s: '.share-launch',
    f: '[data-hud-action="fullscreen"]',
    r: '.remote-launch',
  }
  const selector = shortcutTargets[key]
  if (selector) {
    event.preventDefault()
    if (!event.repeat || key === '[' || key === ']') {
      controls.value?.querySelector<HTMLButtonElement>(selector)?.click()
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
    event.preventDefault()
    if (!event.repeat) tv.muteToggle()
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
      <ChannelTuning
        v-if="tv.waitingForPlayback"
        :label="tv.channelLabel"
        :description="tv.currentChannel.blurb"
      />
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
            <button
              type="button"
              aria-label="Previous channel"
              aria-keyshortcuts="["
              data-shortcut="Previous channel · ["
              @click="tv.channelStep(-1)"
            >
              <WatchIcon name="channel-down" /><span>CH −</span>
            </button>
            <button
              type="button"
              aria-label="Next channel"
              aria-keyshortcuts="]"
              data-shortcut="Next channel · ]"
              @click="tv.channelStep(1)"
            >
              <WatchIcon name="channel-up" /><span>CH +</span>
            </button>
            <ChannelGuide
              aria-keyshortcuts="C"
              data-shortcut="Channel guide · C"
              :current-channel="tv.channelNumber"
              @tune="tv.setChannel"
              @open-change="guideOpen = $event"
            />
            <button
              type="button"
              aria-label="Volume down"
              aria-keyshortcuts="-"
              data-shortcut="Volume down · −"
              @click="tv.volumeStep(-5)"
            >
              <WatchIcon name="volume-down" /><span>VOL −</span>
            </button>
            <button
              type="button"
              aria-label="Volume up"
              aria-keyshortcuts="Plus ="
              data-shortcut="Volume up · +"
              @click="tv.volumeStep(5)"
            >
              <WatchIcon name="volume-up" /><span>VOL +</span>
            </button>
            <button
              type="button"
              :aria-label="tv.volume.muted ? 'Unmute' : 'Mute'"
              aria-keyshortcuts="M"
              :data-shortcut="`${tv.volume.muted ? 'Unmute' : 'Mute'} · M`"
              :aria-pressed="tv.volume.muted"
              @click="tv.muteToggle()"
            >
              <WatchIcon :name="tv.volume.muted ? 'mute' : 'sound'" />
              <span>{{ tv.volume.muted ? 'Unmute' : 'Mute' }}</span>
            </button>
            <ChannelShare
              aria-keyshortcuts="S"
              data-shortcut="Share channel · S"
              :channel-number="tv.channelNumber"
              @open-change="shareOpen = $event"
            />
          </template>
          <button
            type="button"
            :aria-label="fullscreen.active.value ? 'Exit fullscreen' : 'Enter fullscreen'"
            data-hud-action="fullscreen"
            aria-keyshortcuts="F"
            :data-shortcut="`${fullscreen.active.value ? 'Exit fullscreen' : 'Fullscreen'} · F`"
            :aria-pressed="fullscreen.active.value"
            @click="fullscreen.toggle"
          >
            <WatchIcon :name="fullscreen.active.value ? 'restore' : 'fullscreen'" />
            <span>{{ fullscreen.active.value ? 'Exit fullscreen' : 'Fullscreen' }}</span>
          </button>
          <RemotePairing
            aria-keyshortcuts="R"
            data-shortcut="Phone remote · R"
            @open-change="pairingOpen = $event"
          />
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
    max(24px, calc(env(safe-area-inset-bottom) + 12px)) max(1rem, env(safe-area-inset-left));
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
  gap: 0.3rem;
  align-self: center;
  max-width: 100%;
  padding: 0.4rem;
  border: 1px solid #55594e;
  border-radius: 9px;
  background:
    repeating-linear-gradient(to bottom, #0003 0 1px, transparent 1px 3px),
    linear-gradient(#30332e, #171c18);
  box-shadow:
    inset 0 1px #777a68,
    0 4px 0 #090d0a,
    0 8px 24px #0009;
}
.control-row > button,
.control-row :deep(.guide-launch),
.control-row :deep(.share-launch),
.control-row :deep(.remote-launch) {
  position: relative;
  inset: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-height: 50px;
  min-width: 44px;
  padding: 0.3rem 0.5rem;
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
  font-size: clamp(0.55rem, 0.7vw, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  pointer-events: auto;
}
.control-row > button::after,
.control-row :deep(.guide-launch)::after,
.control-row :deep(.share-launch)::after,
.control-row :deep(.remote-launch)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(to bottom, #0003 0 1px, transparent 1px 3px);
  box-shadow: inset 0 0 10px #0003;
  pointer-events: none;
}
.control-row :deep(button[data-shortcut])::before {
  content: attr(data-shortcut);
  position: absolute;
  width: max-content;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: 10;
  transform: translateX(var(--shortcut-offset, -50%)) translateY(3px);
  padding: 0.45rem 0.6rem;
  border: 1px solid #65836b;
  border-radius: 4px;
  background: #08110bf5;
  color: var(--crt-cream);
  font-size: 0.7rem;
  line-height: 1.3;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
  box-shadow: 0 3px 10px #0008;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.control-row :deep(button[data-shortcut]:hover)::before,
.control-row :deep(button[data-shortcut]:focus-visible)::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(var(--shortcut-offset, -50%));
}
.control-row > button:first-child::before {
  --shortcut-offset: 0%;
  left: 0;
  transform: none;
}
.control-row :deep(button.remote-launch[data-shortcut])::before {
  --shortcut-offset: 0%;
  left: auto;
  right: 0;
  transform: none;
}
.control-row :deep(.watch-icon) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 3px #8fd9a455);
}
.control-row > button:hover,
.control-row :deep(.guide-launch:hover),
.control-row :deep(.share-launch:hover),
.control-row :deep(.remote-launch:hover) {
  color: #c6ffd1;
  background: linear-gradient(#354e3a, #192b1e);
}
.control-row > button:active,
.control-row :deep(.guide-launch:active),
.control-row :deep(.share-launch:active),
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
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: min(100%, 340px);
    gap: 0.25rem;
    padding: 0.35rem;
  }
  .control-row > button,
  .control-row :deep(.guide-launch),
  .control-row :deep(.share-launch),
  .control-row :deep(.remote-launch) {
    min-height: 50px;
    min-width: 44px;
    padding: 0.25rem 0.1rem;
    font-size: 0.5rem;
    letter-spacing: 0;
    overflow-wrap: anywhere;
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
  .control-row,
  .control-row :deep(button[data-shortcut])::before {
    transition: none;
  }
  .player-controls--hidden {
    transform: none;
  }
}
</style>
