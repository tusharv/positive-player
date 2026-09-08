<script setup lang="ts">
defineEmits<{
  power: []
}>()
</script>

<template>
  <button class="power" type="button" @click="$emit('power')">
    <span class="power-dot" aria-hidden="true" />
    Press to turn on
  </button>
</template>

<style scoped>
.power {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-content: center;
  gap: 0.7rem;
  border: 0;
  background: radial-gradient(ellipse at 50% 50%, #1a1a1a, #050505);
  color: #c8c2b8;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.power:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: -10px;
}

.power-dot {
  width: 12px;
  height: 12px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid #8a8a8a;
}

.power:active .power-dot {
  border-color: var(--crt-phosphor);
  box-shadow: 0 0 10px var(--crt-phosphor);
}
</style>
