<script setup lang="ts"></script>

<template>
  <div class="crt">
    <div class="crt-bezel">
      <div class="crt-screen">
        <div class="crt-stage">
          <slot />
        </div>
        <div class="crt-scan" aria-hidden="true" />
        <div class="crt-grain" aria-hidden="true" />
        <div class="crt-vignette" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.crt {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(ellipse at 50% 20%, #2a2118 0%, var(--crt-bg) 58%);
}

.crt-bezel {
  box-sizing: border-box;
  width: min(96vw, 170dvh);
  height: min(94dvh, 62vw);
  padding: clamp(0.6rem, 2.5vmin, 1.8rem) clamp(0.75rem, 3vmin, 2.2rem);
  border-radius: 1.4rem 1.4rem 1rem 1rem;
  background: linear-gradient(180deg, #2c261e, var(--crt-bezel));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 24px 60px rgba(0, 0, 0, 0.55);
}

.crt-screen {
  position: relative;
  height: 100%;
  border-radius: clamp(1.25rem, 4vmin, 3rem) / clamp(1rem, 3vmin, 2rem);
  overflow: hidden;
  background: #050505;
  box-shadow: inset 0 0 0 3px #111;
}

.crt-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.crt-scan,
.crt-grain,
.crt-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.crt-scan {
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.32) 0 1px,
    transparent 1px 3px
  );
}

.crt-grain {
  inset: -20%;
  background-image: repeating-radial-gradient(circle at 18% 30%, #fff 0 0.45px, transparent 0.8px 3px);
  opacity: 0.1;
  mix-blend-mode: overlay;
  animation: crt-grain 0.18s steps(2) infinite;
}

.crt-vignette {
  box-shadow: inset 0 0 80px 22px rgba(0, 0, 0, 0.62);
}

@keyframes crt-grain {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-5px, 3px);
  }
}

@media (max-width: 720px), (max-height: 500px) {
  .crt-bezel {
    width: 100vw;
    height: 100dvh;
    padding:
      max(0.6rem, env(safe-area-inset-top))
      max(0.6rem, env(safe-area-inset-right))
      max(0.6rem, env(safe-area-inset-bottom))
      max(0.6rem, env(safe-area-inset-left));
    border-radius: 0;
  }

}
</style>
