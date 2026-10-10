<script setup lang="ts">
import { grantLegalConsent, hasLegalConsent } from '../lib/legalConsent'
import SmpteBars from './SmpteBars.vue'

const emit = defineEmits<{
  power: []
}>()

const alreadyAccepted = hasLegalConsent()

function power() {
  grantLegalConsent()
  emit('power')
}
</script>

<template>
  <div class="gate">
    <SmpteBars />
    <div class="stack">
      <div class="power-panel" :class="{ 'power-panel--returning': alreadyAccepted }">
        <button class="power" type="button" @click="power">
          <span class="power-dot" aria-hidden="true" />
          <span class="power-label">Press to turn on</span>
        </button>
        <template v-if="!alreadyAccepted">
          <p class="disclaimer">
            By turning on, you agree to the Privacy Policy and Terms of Service. 1988.in uses
            YouTube API Services. You also agree to the YouTube Terms of Service.
          </p>
          <nav class="legal-links" aria-label="Legal">
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
            <RouterLink to="/terms">Terms of Service</RouterLink>
            <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
              >YouTube Terms of Service</a
            >
          </nav>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gate {
  position: absolute;
  inset: 0;
  /* The power screen belongs under the CRT scanlines, grain and vignette. */
  z-index: 2;
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 1.5rem;
  color: #c8c2b8;
}

.stack {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.25rem;
  width: min(28rem, calc(100% - 0.5rem));
  min-width: 0;
  max-width: 100%;
}

.power-panel {
  display: grid;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  border: 1px solid #3a3a3a;
  background: #111;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
}

.disclaimer {
  margin: 0;
  padding: 0 1.15rem 0.85rem;
  min-width: 0;
  font-size: 0.72rem;
  line-height: 1.6;
  letter-spacing: 0.02em;
  text-align: left;
  text-transform: none;
  overflow-wrap: anywhere;
  color: var(--crt-cream);
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0;
  padding: 0 1.15rem 1.1rem;
  min-width: 0;
  font-size: 0.72rem;
}

.legal-links a {
  color: var(--crt-cream);
}

.power {
  display: grid;
  place-content: center;
  gap: 0.7rem;
  width: 100%;
  min-width: 0;
  min-height: 5.5rem;
  padding: 1rem 1.5rem;
  border: 0;
  border-bottom: 1px solid #3a3a3a;
  background: transparent;
  color: inherit;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.power-label {
  white-space: nowrap;
  text-align: center;
}

.power-panel--returning .power {
  border-bottom: 0;
}

.power:focus-visible,
.legal-links a:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 4px;
}

.power-dot {
  width: 12px;
  height: 12px;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid #8a8a8a;
}

.power:enabled:active .power-dot {
  border-color: var(--crt-phosphor);
  box-shadow: 0 0 10px var(--crt-phosphor);
}
</style>
