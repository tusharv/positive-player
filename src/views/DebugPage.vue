<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CHANNELS, formatChannelNumber, type Channel } from '../data/channels'
import { pickBroadcast, type CatalogItem } from '../lib/broadcastClock'
import {
  fetchChannelCatalog,
  readChannelCatalog,
  MissingApiKeyError,
  QuotaExceededError,
  CatalogFetchError,
} from '../lib/youtubeData'

type Diagnostic = { items: CatalogItem[]; loading: boolean; checked: boolean; error: string }
// Keep catalog refreshes and quota cooldowns local to this debug-page visit.
// Existing TV caches can be read, but debugging must never update them.
const debugCache = new Map<string, string>()
const storage = {
  getItem(key: string) {
    if (debugCache.has(key)) return debugCache.get(key)!
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string) {
    debugCache.set(key, value)
  },
}
const diagnostics = ref<Record<number, Diagnostic>>(
  Object.fromEntries(
    CHANNELS.map((channel) => [
      channel.number,
      {
        items: readChannelCatalog(channel, storage).filter(
          (item) =>
            item &&
            typeof item.videoId === 'string' &&
            Number.isFinite(item.durationSeconds) &&
            item.durationSeconds > 0,
        ),
        loading: false,
        checked: false,
        error: '',
      },
    ]),
  ),
)
const search = ref('')
const now = ref(Date.now())
const loadingAll = ref(false)
let disposed = false
let ticker = 0
const controllers = new Set<AbortController>()
const rows = computed(() =>
  CHANNELS.map((channel) => {
    const diagnostic = diagnostics.value[channel.number]!
    const slot = pickBroadcast(diagnostic.items, now.value / 1000)
    const item = diagnostic.items.find((item) => item.videoId === slot?.videoId)
    return { channel, diagnostic, slot, item }
  }).filter((row) =>
    `${row.channel.number} ${formatChannelNumber(row.channel.number)} ${row.channel.name} ${row.channel.category} ${row.slot?.videoId ?? ''} ${row.item?.title ?? ''}`
      .toLowerCase()
      .includes(search.value.trim().toLowerCase()),
  ),
)
const available = computed(
  () => Object.values(diagnostics.value).filter((row) => row.items.length).length,
)
const failures = computed(() => Object.values(diagnostics.value).filter((row) => row.error).length)

function duration(seconds: number) {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 3600)
    .toString()
    .padStart(2, '0')}:${Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

async function load(channel: Channel) {
  const row = diagnostics.value[channel.number]!
  if (row.loading || disposed) return
  row.loading = true
  row.error = ''
  const controller = new AbortController()
  controllers.add(controller)
  const timeout = window.setTimeout(() => controller.abort(), 30000)
  try {
    const items = await fetchChannelCatalog(channel, {
      apiKey: import.meta.env.VITE_YOUTUBE_API_KEY ?? '',
      fetchFn: (input, init) => fetch(input, { ...init, signal: controller.signal }),
      storage,
    })
    if (!disposed) {
      row.items = items
      row.checked = true
    }
  } catch (error) {
    if (!disposed)
      row.error =
        error instanceof MissingApiKeyError
          ? 'API key is missing. Configure VITE_YOUTUBE_API_KEY.'
          : error instanceof QuotaExceededError
            ? 'YouTube quota exceeded. Try again later.'
            : controller.signal.aborted
              ? 'Request timed out. Retry this channel.'
              : error instanceof CatalogFetchError
                ? `Catalog request failed (${error.message}).`
                : 'Network request failed. Retry this channel.'
  } finally {
    window.clearTimeout(timeout)
    controllers.delete(controller)
    row.loading = false
  }
}

async function loadAll() {
  if (loadingAll.value) return
  loadingAll.value = true
  const queue = [...CHANNELS]
  async function worker() {
    while (!disposed && queue.length) {
      const channel = queue.shift()
      if (channel) await load(channel)
    }
  }
  try {
    await Promise.all([worker(), worker(), worker()])
  } finally {
    loadingAll.value = false
  }
}

onMounted(() => {
  ticker = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  disposed = true
  window.clearInterval(ticker)
  controllers.forEach((controller) => controller.abort())
})
</script>

<template>
  <main class="debug-page">
    <header>
      <RouterLink to="/" class="brand">1988.in</RouterLink>
      <nav aria-label="Debug navigation">
        <RouterLink to="/">Home</RouterLink><RouterLink to="/watch">Watch TV ↗</RouterLink>
      </nav>
    </header>
    <section aria-labelledby="debug-title">
      <p class="eyebrow">Read-only broadcast diagnostics</p>
      <div class="heading">
        <h1 id="debug-title">Channel debug</h1>
        <time :datetime="new Date(now).toISOString()"
          >{{ new Date(now).toISOString().slice(11, 19) }} UTC</time
        >
      </div>
      <p class="description">
        See what each channel is scheduled to play at this moment, using the same broadcast clock as
        the TV.
      </p>
      <p class="notice">
        <strong>Scheduled, not confirmed playback.</strong> This page does not monitor an open TV or
        start videos. Loading data only updates this page; saved TV catalogs, settings, and playback
        stay unchanged. Playback may differ after a failed or skipped video, or when viewers have
        different cached catalogs.
      </p>
    </section>
    <div class="toolbar">
      <label
        >Find a channel or video<input
          v-model="search"
          type="search"
          placeholder="Name, number, category or video…"
      /></label>
      <button type="button" :disabled="loadingAll" @click="loadAll">
        {{ loadingAll ? 'Loading catalogs…' : 'Load / refresh all catalogs' }}
      </button>
    </div>
    <p class="help">
      Cached catalogs appear immediately. Load a channel below to download only its bundled list, or
      load all. Bundled lists work without an API key. When a key is configured, optional
      availability checks use YouTube API quota and are reused for 24 hours.
    </p>
    <div class="summary" role="status">
      <span>{{ available }} / {{ CHANNELS.length }} catalogs available</span
      ><span>{{ failures }} request errors</span><span>{{ rows.length }} channels shown</span>
    </div>
    <div class="table-scroll" role="region" aria-label="Channel schedules" tabindex="0">
      <table>
        <caption class="sr-only">
          Channel schedules at the current UTC time
        </caption>
        <thead>
          <tr>
            <th scope="col">Channel / source</th>
            <th scope="col">Scheduled now</th>
            <th scope="col">Offset / duration</th>
            <th scope="col">Catalog</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.channel.number">
            <th scope="row">
              <span class="channel-number">CH {{ formatChannelNumber(row.channel.number) }}</span
              ><strong>{{ row.channel.name }}</strong
              ><a
                v-if="row.channel.kind !== 'curated' && row.channel.playlistId"
                :href="`https://www.youtube.com/playlist?list=${encodeURIComponent(row.channel.playlistId)}`"
                target="_blank"
                rel="noopener noreferrer"
                >Source playlist ↗</a
              >
              <small v-else-if="row.channel.kind === 'curated'">Curated selection</small
              ><small v-else>{{ row.channel.query }}</small>
            </th>
            <td>
              <template v-if="row.slot"
                ><a
                  class="video-link"
                  :href="`https://www.youtube.com/watch?v=${encodeURIComponent(row.slot.videoId)}&t=${row.slot.startSeconds}s`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ row.item?.title || row.slot.videoId }} ↗</a
                ><small v-if="row.item?.title">{{ row.slot.videoId }}</small
                ><small v-else>Title unavailable in this catalog</small></template
              ><span v-else class="muted">No schedule available</span>
            </td>
            <td class="timing">
              <template v-if="row.slot && row.item"
                >{{ duration(row.slot.startSeconds)
                }}<small>/ {{ duration(row.item.durationSeconds) }}</small></template
              ><span v-else>—</span>
            </td>
            <td>
              <span :class="{ error: row.diagnostic.error }">{{
                row.diagnostic.loading
                  ? 'Loading…'
                  : row.diagnostic.error ||
                    (row.diagnostic.items.length
                      ? `${row.diagnostic.items.length} video${row.diagnostic.items.length === 1 ? '' : 's'}`
                      : row.diagnostic.checked
                        ? 'No playable videos'
                        : 'Not loaded')
              }}</span
              ><small v-if="row.diagnostic.items.length">{{
                row.diagnostic.checked ? 'Available · may use cache' : 'Cached schedule'
              }}</small
              ><button
                class="load-one"
                type="button"
                :aria-label="`Load ${row.channel.name} catalog`"
                :disabled="row.diagnostic.loading || loadingAll"
                @click="load(row.channel)"
              >
                {{ row.diagnostic.error ? 'Retry' : 'Load / refresh' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!rows.length" class="empty">
        No channels match. Try a different name, number or video.
      </p>
    </div>
  </main>
</template>

<style scoped>
.debug-page {
  --paper: #f5f4ed;
  --ink: #182645;
  --blue: #183b9b;
  --muted: #586078;
  box-sizing: border-box;
  min-height: 100dvh;
  padding: 0 max(5%, calc((100vw - 1400px) / 2)) 4rem;
  background: var(--paper);
  color: var(--ink);
  font:
    15px/1.6 Arial,
    Helvetica,
    sans-serif;
}
.debug-page * {
  box-sizing: border-box;
}
header,
nav,
.heading,
.toolbar,
.summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
header {
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--ink);
  margin-bottom: 2.5rem;
}
a {
  color: var(--blue);
  text-underline-offset: 3px;
}
.brand {
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
}
.eyebrow,
time,
.channel-number,
.timing {
  font-family: 'IBM Plex Mono', monospace;
}
.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  margin: 0;
}
h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
  margin: 0.5rem 0;
  letter-spacing: -0.04em;
}
time {
  color: var(--blue);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}
.description {
  max-width: 740px;
  font-size: 1.05rem;
}
.notice {
  padding: 1rem 1.2rem;
  border-left: 4px solid var(--blue);
  background: #e8ecf5;
  max-width: 960px;
}
.toolbar {
  margin-top: 2rem;
  align-items: end;
}
label {
  display: grid;
  gap: 0.4rem;
  width: min(100%, 440px);
  font-weight: 600;
}
input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--muted);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  font: inherit;
}
button {
  padding: 0.85rem 1rem;
  background: var(--blue);
  color: white;
  border: 1px solid var(--blue);
  border-radius: 3px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.55;
  cursor: wait;
}
.help {
  color: var(--muted);
  font-size: 0.82rem;
  max-width: 960px;
}
.summary {
  justify-content: start;
  padding: 1rem 0;
  font-size: 0.8rem;
  border-bottom: 2px solid var(--ink);
}
.table-scroll {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
  text-align: left;
  font-size: 0.9rem;
}
thead {
  background: #e8ecf5;
}
th,
td {
  padding: 1rem;
  border-bottom: 1px solid #ccd0d8;
  vertical-align: top;
}
thead th {
  white-space: nowrap;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
tbody th {
  min-width: 190px;
  width: 24%;
  font-weight: 400;
}
tbody th strong,
.channel-number,
small {
  display: block;
}
.channel-number {
  font-size: 0.7rem;
  color: var(--muted);
}
tbody th strong {
  font-size: 1rem;
  margin: 0.25rem 0;
}
tbody th a,
small {
  font-size: 0.75rem;
}
small,
.muted {
  color: var(--muted);
}
.video-link {
  overflow-wrap: anywhere;
}
td:nth-child(2) {
  width: 35%;
  min-width: 220px;
}
.timing {
  white-space: nowrap;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
td:last-child {
  min-width: 210px;
}
.load-one {
  display: block;
  background: transparent;
  color: var(--blue);
  padding: 0.4rem 0.6rem;
  margin-top: 0.65rem;
  font-size: 0.75rem;
}
.error {
  color: #9f2525;
}
.empty {
  padding: 2rem 1rem;
}
a:focus-visible,
button:focus-visible,
input:focus-visible,
.table-scroll:focus-visible {
  outline: 3px solid #b35b30;
  outline-offset: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 600px) {
  header {
    margin-bottom: 1.5rem;
  }
  .toolbar,
  .toolbar button,
  label {
    width: 100%;
  }
  .summary {
    gap: 0.5rem 1rem;
  }
}
</style>
