<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="tuning" role="status" data-testid="channel-tuning">
    <div class="tuning-card">
      <p class="station">{{ label }}</p>
      <div class="frequency" aria-hidden="true"><span /></div>
      <p class="message">Tuning in…</p>
    </div>
  </div>
</template>

<style scoped>
.tuning {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  pointer-events: none;
  background: #0003;
  color: var(--crt-phosphor);
  text-align: center;
}
.tuning-card {
  width: min(75%, 24rem);
  box-sizing: border-box;
  padding: 1.25rem 1.5rem;
  border: 1px solid #8fd9a455;
  background: #08110beb;
  box-shadow: 0 0 28px #0008;
}
.station {
  font-size: clamp(0.9rem, 2.5vw, 1.4rem);
  letter-spacing: 0.08em;
}
.frequency {
  position: relative;
  height: 1.5rem;
  margin: 1.5rem 0;
  border-bottom: 1px solid #65836b;
  background: repeating-linear-gradient(90deg, #65836b 0 1px, transparent 1px 12px);
}
.frequency span {
  position: absolute;
  left: 50%;
  top: -0.35rem;
  bottom: -0.35rem;
  width: 3px;
  background: #e8c56b;
  box-shadow: 0 0 10px #e8c56b66;
}
.message {
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>
