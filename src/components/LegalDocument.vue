<script setup lang="ts">
defineProps<{
  title: string
  updated: string
}>()
</script>

<template>
  <div class="legal">
    <header class="masthead">
      <RouterLink class="callsign" to="/">1988.in</RouterLink>
      <p class="station-id">Station notice · 1988.in</p>
      <nav aria-label="Legal">
        <RouterLink to="/privacy">Privacy Policy</RouterLink>
        <RouterLink to="/terms">Terms of Service</RouterLink>
        <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
          >YouTube Terms of Service</a
        >
        <RouterLink to="/watch">Back to TV</RouterLink>
      </nav>
    </header>
    <article>
      <p class="kicker">Broadcast legal crawl</p>
      <h1>{{ title }}</h1>
      <p class="updated">Effective {{ updated }}</p>
      <slot />
    </article>
  </div>
</template>

<style scoped>
.legal {
  box-sizing: border-box;
  min-height: 100dvh;
  padding: 2rem 1.25rem 4rem;
  background: radial-gradient(ellipse at 50% 0, #2a2118 0%, var(--crt-bg) 52%);
}

.masthead,
article {
  max-width: 42rem;
  margin: 0 auto;
}

.callsign {
  color: var(--crt-phosphor);
  text-decoration: none;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.station-id {
  margin: 0.4rem 0 1rem;
  color: #b0a38f;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--crt-phosphor) 35%, transparent);
  font-size: 0.75rem;
}

nav a {
  color: var(--crt-cream);
}

nav a.router-link-active:not([href='/']) {
  color: var(--crt-phosphor);
}

article {
  padding-top: 2rem;
}

.kicker {
  margin: 0 0 0.5rem;
  color: var(--crt-phosphor);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 0.4rem;
  font-size: 1.7rem;
  font-weight: 500;
  line-height: 1.2;
}

.updated {
  margin: 0 0 2rem;
  color: #b0a38f;
  font-size: 0.78rem;
}

article :deep(h2) {
  margin: 2rem 0 0.7rem;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--crt-phosphor);
}

article :deep(p),
article :deep(li) {
  line-height: 1.7;
  font-size: 0.92rem;
}

article :deep(ul) {
  padding-left: 1.2rem;
}

article :deep(a) {
  color: var(--crt-cream);
}

article :deep(a:focus-visible),
nav a:focus-visible,
.callsign:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 3px;
}
</style>
