<script setup lang="ts">
defineProps<{ label: string; description?: string }>()
</script>

<template>
  <div class="tuning" role="status" data-testid="channel-tuning">
    <div class="tuning-card">
      <svg
        class="antenna"
        viewBox="0 0 80 64"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M40 38v18m-14 4h28M32 56h16" />
        <g class="antenna-head">
          <path d="M40 38V12m-20 8h40M25 28h30M30 36h20" />
          <circle cx="40" cy="9" r="3" />
        </g>
      </svg>
      <p class="station">{{ label }}</p>
      <p v-if="description" class="description">{{ description }}</p>
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
.antenna {
  display: block;
  width: 64px;
  height: 52px;
  margin: 0 auto;
  filter: drop-shadow(0 0 5px #8fd9a455);
}
.antenna-head {
  transform-origin: 40px 38px;
  animation: antenna-tune 2.4s ease-in-out infinite;
}
@keyframes antenna-tune {
  0%,
  100% {
    transform: rotate(-25deg);
  }
  50% {
    transform: rotate(25deg);
  }
}
.description {
  margin: 0.75rem 0 0;
  color: var(--crt-cream);
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
@media (prefers-reduced-motion: reduce) {
  .antenna-head {
    animation: none;
  }
}
.message {
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>
