<script setup lang="ts">
import { computed } from 'vue'
import { CHANNEL_DIGITS } from '../data/channels'

const props = withDefaults(
  defineProps<{
    label: string
    pendingDigits: string
    volume: number
    muted: boolean
    visible: boolean
    volumeVisible: boolean
    programmeTitle?: string
    sleepMinutes?: number
    sleepNotice?: string
    sleepNoticeVisible?: boolean
  }>(),
  {
    programmeTitle: '',
    sleepMinutes: 0,
    sleepNotice: '',
    sleepNoticeVisible: false,
  },
)

const ticks = computed(() => {
  const filled = props.muted ? 0 : Math.round(props.volume / 5)
  return Array.from({ length: 20 }, (_, i) => i < filled)
})

const displayLabel = computed(() => {
  if (!props.pendingDigits) return props.label
  return `CH ${props.pendingDigits.padEnd(CHANNEL_DIGITS, '-')}`
})
</script>

<template>
  <Transition name="hud">
    <p v-if="visible" class="channel-label">
      {{ displayLabel }}
      <span v-if="programmeTitle && !pendingDigits" class="programme-title">{{
        programmeTitle
      }}</span>
      <span v-if="sleepNoticeVisible && sleepNotice" class="sleep-notice">{{ sleepNotice }}</span>
    </p>
  </Transition>
  <p v-if="sleepMinutes" class="sleep-mark">SLEEP {{ sleepMinutes }}</p>
  <Transition name="hud">
    <div
      v-if="volumeVisible"
      class="volume-display"
      role="meter"
      aria-label="Volume"
      :aria-valuenow="muted ? 0 : volume"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuetext="muted ? 'Muted' : `${volume}%`"
    >
      <p class="volume-label">{{ muted ? 'MUTE' : 'VOLUME' }}</p>
      <div class="bar" aria-hidden="true">
        <span v-for="(on, i) in ticks" :key="i" class="tick" :class="{ on }" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.channel-label,
.volume-display,
.sleep-mark {
  z-index: 3;
  pointer-events: none;
}
.programme-title,
.sleep-notice {
  display: block;
  margin-top: 0.35rem;
  font-size: clamp(0.85rem, 2vw, 1.25rem);
  letter-spacing: 0.04em;
  line-height: 1.3;
}
.programme-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.sleep-mark {
  position: absolute;
  top: 1rem;
  left: 1rem;
  margin: 0;
  padding: 0.35rem 0.55rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
  color: var(--crt-phosphor);
  font-size: clamp(0.75rem, 1.6vw, 0.95rem);
  letter-spacing: 0.12em;
  line-height: 1;
  text-shadow:
    0 2px 4px #000,
    0 0 8px rgba(80, 200, 120, 0.45);
}
.channel-label {
  position: absolute;
  top: 1rem;
  right: 1rem;
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
  padding: 0.65rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
  margin: 0;
  text-align: right;
  overflow-wrap: anywhere;
  color: var(--crt-phosphor);
  font-size: clamp(1.4rem, 4vw, 3rem);
  line-height: 1.15;
  letter-spacing: 0.08em;
  text-shadow:
    0 2px 4px #000,
    0 0 8px rgba(80, 200, 120, 0.45);
}
.volume-display {
  position: absolute;
  bottom: max(5.5rem, 16%);
  left: 8%;
  color: #fff;
  text-shadow: 0 1px 2px #000;
}
.volume-label {
  margin: 0 0 0.4rem;
  font-size: clamp(0.85rem, 1.8vw, 1.15rem);
  line-height: 1;
}
.bar {
  display: flex;
  align-items: center;
  gap: clamp(3px, 0.5vw, 6px);
  height: 12px;
}
.tick {
  width: clamp(4px, 0.6vw, 7px);
  height: 2px;
  background: currentColor;
}
.tick.on {
  width: clamp(3px, 0.4vw, 5px);
  height: 12px;
}
.hud-enter-active,
.hud-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.hud-enter-from,
.hud-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .hud-enter-active,
  .hud-leave-active {
    transition: none;
  }
  .hud-enter-from,
  .hud-leave-to {
    transform: none;
  }
}
</style>
