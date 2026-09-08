<script setup lang="ts">
import { computed } from 'vue'
import { channelByNumber, formatChannelLabel, formatChannelNumber } from '../data/channels'

const props = defineProps<{
  channelNumber: number
}>()

const label = computed(() => {
  const channel = channelByNumber(props.channelNumber)
  return channel ? formatChannelLabel(channel) : `CH ${formatChannelNumber(props.channelNumber)}`
})
</script>

<template>
  <div class="card" role="status">
    <div class="rule" aria-hidden="true" />
    <p class="hi">रुकावट के लिए खेद है</p>
    <p class="en">Sorry for the interruption</p>
    <p class="ch">{{ label }}</p>
  </div>
</template>

<style scoped>
.card {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-content: center;
  justify-items: center;
  background: radial-gradient(ellipse at 50% 45%, #1a120a 0%, #050505 68%);
  text-align: center;
}

.rule {
  width: 72px;
  height: 2px;
  margin-bottom: 1.1rem;
  background: linear-gradient(90deg, #c45c26, #e8c56b, #2f6b3a);
}

.hi {
  margin: 0;
  font-family: 'Tiro Devanagari Hindi', 'Noto Serif Devanagari', serif;
  font-size: clamp(1.4rem, 3.4vw, 2.1rem);
  line-height: 1.35;
  color: var(--crt-cream);
  text-shadow: 0 0 18px rgba(243, 234, 212, 0.18);
}

.en {
  margin: 0.85rem 0 0;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.ch {
  position: absolute;
  bottom: 1.2rem;
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  opacity: 0.35;
}
</style>
