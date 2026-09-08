<script setup lang="ts">
import { computed } from 'vue'
import { CHANNEL_DIGITS } from '../data/channels'

const props = defineProps<{
  label: string
  pendingDigits: string
  volume: number
  muted: boolean
  visible: boolean
}>()

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
  <div class="hud" :class="{ fade: !visible }">
    <p class="channel-label">{{ displayLabel }}</p>
    <div
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
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.hud.fade {
  opacity: 0.18;
}
.channel-label {
  position: absolute;
  top: max(5.5rem, 18%);
  right: 6%;
  left: 6%;
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
  filter: drop-shadow(0 1px 2px #000);
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
@media (prefers-reduced-motion: reduce) {
  .hud {
    transition: none;
  }
}
</style>
