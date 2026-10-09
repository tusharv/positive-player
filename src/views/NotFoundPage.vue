<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AnalogSnow from '../components/AnalogSnow.vue'
import CrtShell from '../components/CrtShell.vue'
import SmpteBars from '../components/SmpteBars.vue'

const route = useRoute()
const locking = ref(false)
const input = computed(() => {
  const path = route.fullPath || '/'
  return path.length > 42 ? `${path.slice(0, 41)}…` : path
})

const previousTitle = typeof document === 'undefined' ? '' : document.title

onMounted(() => {
  document.title = 'CH 404 - 1988.in'
})

onBeforeUnmount(() => {
  document.title = previousTitle
})
</script>

<template>
  <CrtShell>
    <div class="off-air" :class="{ locking }">
      <SmpteBars />
      <div class="snow-layer">
        <AnalogSnow />
      </div>
      <p class="ghost" aria-hidden="true">404</p>
      <p class="channel">CH 404</p>
      <main aria-labelledby="off-air-title">
        <div class="osd">
          <p class="hi" lang="hi">रुकावट के लिए खेद है</p>
          <h1 id="off-air-title">NO SIGNAL</h1>
          <p class="copy">This frequency is empty. Tune back to the set.</p>
          <p class="input">INPUT {{ input }}</p>
          <div class="actions">
            <RouterLink
              class="watch"
              to="/watch"
              @pointerenter="locking = true"
              @pointerleave="locking = false"
              @focus="locking = true"
              @blur="locking = false"
              >Watch TV</RouterLink
            >
            <RouterLink class="home" to="/">Home</RouterLink>
          </div>
        </div>
      </main>
      <p class="ticker" aria-hidden="true">
        <span class="track">
          <span>PLEASE STAND BY &nbsp;&nbsp; THIS FREQUENCY IS EMPTY &nbsp;&nbsp; TUNE BACK TO THE SET</span>
          <span>PLEASE STAND BY &nbsp;&nbsp; THIS FREQUENCY IS EMPTY &nbsp;&nbsp; TUNE BACK TO THE SET</span>
        </span>
      </p>
    </div>
  </CrtShell>
</template>

<style scoped>
.off-air {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--crt-cream);
}

.snow-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.9;
  mix-blend-mode: multiply;
  transition: opacity 0.55s ease;
}

.locking .snow-layer {
  opacity: 0.38;
}

.ghost {
  position: absolute;
  z-index: 1;
  top: 6%;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  font-size: clamp(6.5rem, 26vw, 16rem);
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.1;
  color: #ececec;
  text-shadow:
    -5px 0 #c43a3a,
    5px 0 #3a8ec4;
  opacity: 0.55;
  pointer-events: none;
  mix-blend-mode: screen;
  transition: opacity 0.55s ease;
}

.locking .ghost {
  opacity: 0.12;
}

.channel {
  position: absolute;
  z-index: 2;
  top: 1rem;
  right: 1.1rem;
  margin: 0;
  color: var(--crt-phosphor);
  font-size: clamp(1.4rem, 4vw, 2.8rem);
  letter-spacing: 0.08em;
  text-shadow:
    0 2px 4px #000,
    0 0 8px rgba(80, 200, 120, 0.45);
  pointer-events: none;
}

main {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  min-height: 100%;
  padding: clamp(1.1rem, 3.5vmin, 2.2rem);
  padding-bottom: 3.2rem;
}

.osd {
  max-width: min(34rem, 100%);
}

.hi,
h1,
.copy,
.input {
  text-shadow:
    0 2px 8px #000,
    0 0 18px #000;
}

.hi {
  margin: 0;
  font-family: 'Tiro Devanagari Hindi', 'Noto Serif Devanagari', serif;
  font-size: clamp(1.35rem, 3.2vw, 2rem);
  line-height: 1.2;
  color: var(--crt-cream);
}

h1 {
  margin: 0.2rem 0 0;
  font-size: clamp(1.85rem, 5.4vw, 3.2rem);
  font-weight: 500;
  letter-spacing: 0.16em;
  line-height: 1.1;
  padding-bottom: 0.15rem;
}

.copy {
  margin: 0.65rem 0 0;
  font-size: clamp(0.85rem, 1.8vw, 1rem);
  line-height: 1.45;
  color: var(--crt-cream);
}

.input {
  margin: 0.55rem 0 0;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--crt-phosphor);
  overflow-wrap: anywhere;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.15rem;
}

.watch,
.home {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  min-height: 2.5rem;
  padding: 0.4rem 1.05rem;
  border-radius: 0.2rem;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
  white-space: nowrap;
}

.watch {
  background: var(--crt-phosphor);
  color: #08110b;
}

.home {
  border: 1px solid var(--crt-cream);
  background: #050505d9;
  color: var(--crt-cream);
}

.watch:focus-visible,
.home:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 4px;
}

.watch:active,
.home:active {
  transform: translateY(1px);
}

.ticker {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  overflow: hidden;
  background: #050505e6;
  color: var(--crt-phosphor);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  line-height: 2.2;
  white-space: nowrap;
}

.track {
  display: flex;
  gap: 3rem;
  width: max-content;
  animation: stand-by 22s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .snow-layer,
  .ghost {
    transition: none;
  }

  .track {
    animation: none;
  }
}

@keyframes stand-by {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 720px) {
  .ghost {
    top: 10%;
    font-size: clamp(5.5rem, 34vw, 9rem);
  }
}
</style>
