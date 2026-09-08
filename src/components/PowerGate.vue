<script setup lang="ts">
import { ref, watch } from 'vue'
import { grantLegalConsent, hasLegalConsent, withdrawLegalConsent } from '../lib/legalConsent'
import SmpteBars from './SmpteBars.vue'

const emit = defineEmits<{
  power: []
}>()

const alreadyAccepted = hasLegalConsent()
const agreed = ref(alreadyAccepted)

watch(agreed, (value) => {
  if (value) grantLegalConsent()
  else withdrawLegalConsent()
})

function power() {
  if (!agreed.value) return
  emit('power')
}
</script>

<template>
  <div class="gate">
    <SmpteBars />
    <div class="stack">
      <fieldset v-if="!alreadyAccepted" class="consent">
        <legend id="consent-title">Station notice</legend>
        <label class="agree" for="legal-consent">
          <input id="legal-consent" v-model="agreed" type="checkbox" />
          <span>
            I agree to the Privacy Policy and Terms of Service. 1988.in uses YouTube API
            Services. I also agree to the YouTube Terms of Service.
          </span>
        </label>
        <nav class="legal-links" aria-label="Legal">
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
            >YouTube Terms of Service</a
          >
        </nav>
      </fieldset>
      <button class="power" type="button" :disabled="!agreed" @click="power">
        <span class="power-dot" aria-hidden="true" />
        Press to turn on
      </button>
    </div>
  </div>
</template>

<style scoped>
.gate {
  position: absolute;
  inset: 0;
  z-index: 4;
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
  width: min(28rem, 100%);
}

.consent {
  margin: 0;
  padding: 1rem 1.15rem 1.15rem;
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--crt-phosphor) 45%, #6a6258);
  background: #0d0d0d;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
}

.consent legend {
  padding: 0 0.5rem;
  color: var(--crt-phosphor);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.agree {
  display: grid;
  grid-template-columns: 1.1rem 1fr;
  align-items: start;
  column-gap: 0.75rem;
  min-width: 0;
  font-size: 0.72rem;
  line-height: 1.6;
  cursor: pointer;
}

.agree input {
  width: 1rem;
  height: 1rem;
  margin: 0.2rem 0 0;
  accent-color: var(--crt-phosphor);
}

.agree span {
  min-width: 0;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0.9rem 0 0;
  padding-left: 1.85rem;
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
  min-height: 5.5rem;
  padding: 1rem 1.5rem;
  border: 1px solid #3a3a3a;
  background: #111;
  color: inherit;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
}

.power:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.power:focus-visible,
.consent a:focus-visible,
.consent input:focus-visible {
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
