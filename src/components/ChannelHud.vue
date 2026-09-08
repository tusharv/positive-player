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

const emit = defineEmits<{
  'channel-step': [delta: number]
  'volume-step': [delta: number]
}>()

const ticks = computed(() => {
  const filled = props.muted ? 0 : Math.round(props.volume / 10)
  return Array.from({ length: 10 }, (_, i) => i < filled)
})

const displayLabel = computed(() => {
  if (!props.pendingDigits) return props.label
  return `CH ${props.pendingDigits.padEnd(CHANNEL_DIGITS, '-')}`
})
</script>

<template>
  <div class="hud" :class="{ fade: !visible }">
    <div class="cluster left">
      <button type="button" @click="emit('volume-step', 5)">VOL +</button>
      <button type="button" @click="emit('volume-step', -5)">VOL −</button>
    </div>

    <div class="readout">
      <p class="label">{{ displayLabel }}</p>
      <div class="bar" aria-hidden="true">
        <span v-for="(on, i) in ticks" :key="i" class="tick" :class="{ on }" />
      </div>
      <p v-if="muted" class="mute">MUTE</p>
    </div>

    <div class="cluster right">
      <button type="button" @click="emit('channel-step', 1)">CH +</button>
      <button type="button" @click="emit('channel-step', -1)">CH −</button>
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  padding: 1.1rem 1.3rem;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.hud.fade {
  opacity: 0.18;
}

.cluster {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  pointer-events: auto;
}

.cluster.right {
  align-items: end;
}

button {
  border: 0;
  background: rgba(0, 0, 0, 0.45);
  color: var(--crt-phosphor);
  letter-spacing: 0.12em;
  font-size: 0.7rem;
  padding: 0.28rem 0.5rem;
  cursor: pointer;
}

button:focus-visible {
  outline: 1px solid var(--crt-phosphor);
}

button:active {
  transform: scale(0.98);
}

.readout {
  justify-self: start;
  padding-left: 0.4rem;
}

.label,
.mute {
  margin: 0;
  color: var(--crt-phosphor);
  letter-spacing: 0.16em;
  text-shadow: 0 0 8px rgba(80, 200, 120, 0.45);
}

.label {
  font-size: 0.82rem;
}

.mute {
  margin-top: 0.25rem;
  font-size: 0.65rem;
  opacity: 0.8;
}

.bar {
  display: flex;
  gap: 3px;
  margin-top: 0.4rem;
}

.tick {
  width: 8px;
  height: 6px;
  background: var(--crt-dim);
}

.tick.on {
  background: var(--crt-phosphor);
}
</style>
