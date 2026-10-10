<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { CHANNELS, channelByNumber, formatChannelLabel } from '../data/channels'
import type { CatalogItem } from '../lib/broadcastClock'
import { programmeDuration, programmeSchedule } from '../lib/programmeSchedule'
import { readChannelCatalog } from '../lib/youtubeData'

const route = useRoute()
const router = useRouter()
const channel = computed(() => channelByNumber(Number(route.query.channel)) ?? CHANNELS[0]!)
const search = ref('')
const choices = computed(() =>
  CHANNELS.filter((item) =>
    `${item.number} ${item.name}`.toLowerCase().includes(search.value.toLowerCase().trim()),
  ),
)
const items = ref<CatalogItem[]>([])
const loading = ref(false)
const error = ref(false)
const now = ref(Date.now() / 1000)
const listings = computed(() => programmeSchedule(items.value, now.value))
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const time = (seconds: number) => timeFormat.format(seconds * 1000)
const day = (seconds: number) => dateFormat.format(seconds * 1000)
let request = 0
let disposed = false
const timer = window.setInterval(() => {
  now.value = Date.now() / 1000
}, 30000)
const previousTitle = document.title
onBeforeUnmount(() => {
  disposed = true
  request++
  window.clearInterval(timer)
  document.title = previousTitle
})
async function load() {
  const current = ++request
  const selected = channel.value
  loading.value = true
  error.value = false
  items.value = []
  document.title = `${selected.name} · 24-hour guide - 1988.in`
  try {
    const cached = readChannelCatalog(selected, {
      getItem(key) {
        try {
          const value = localStorage.getItem(key)
          if (value) return value
        } catch {
          /* Storage may be disabled. */
        }
        try {
          return sessionStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem() {},
    })
    const catalog = cached.length
      ? cached
      : ((await selected.loadCuratedCatalog?.()) ?? selected.curatedCatalog ?? [])
    if (current !== request || disposed) return
    items.value = catalog
    now.value = Date.now() / 1000
  } catch {
    if (current === request && !disposed) error.value = true
  } finally {
    if (current === request && !disposed) loading.value = false
  }
}
watch(channel, load, { immediate: true })
function select(event: Event) {
  const number = (event.target as HTMLSelectElement).value
  void router.replace({ path: '/guide', query: { channel: number } })
}
</script>

<template>
  <main class="schedule-page">
    <header class="masthead">
      <RouterLink to="/" class="brand">1988.in</RouterLink
      ><RouterLink :to="{ path: '/watch', query: { channel: String(channel.number) } }"
        >Back to TV <span aria-hidden="true">↗</span></RouterLink
      >
    </header>
    <section class="intro" aria-labelledby="guide-title">
      <p class="eyebrow">Your television timetable</p>
      <h1 id="guide-title">Next 24 hours.</h1>
      <p>Find your channel. See what’s on next.</p>
    </section>
    <div class="channel-picker">
      <div>
        <label for="channel-search">Find a channel</label
        ><input
          id="channel-search"
          v-model="search"
          type="search"
          placeholder="Name or channel number"
        />
      </div>
      <div>
        <label for="channel-select">Channel</label
        ><select id="channel-select" :value="channel.number" @change="select">
          <option
            v-if="!choices.some((item) => item.number === channel.number)"
            :value="channel.number"
          >
            {{ formatChannelLabel(channel) }}
          </option>
          <option v-for="item in choices" :key="item.number" :value="item.number">
            {{ formatChannelLabel(item) }}
          </option>
        </select>
      </div>
      <p v-if="!choices.length" class="no-matches" role="status">No channels match your search.</p>
    </div>
    <section class="schedule" :aria-busy="loading" aria-labelledby="station-title">
      <header class="station-heading">
        <div>
          <p class="eyebrow">Channel {{ String(channel.number).padStart(3, '0') }}</p>
          <h2 id="station-title">{{ channel.name }}</h2>
        </div>
        <RouterLink
          class="watch-link"
          :to="{ path: '/watch', query: { channel: String(channel.number) } }"
          >Watch channel →</RouterLink
        >
      </header>
      <p class="time-note">
        {{ day(now) }} {{ time(now) }} – {{ day(now + 86400) }} {{ time(now + 86400) }} ·
        {{ timezone }}
      </p>
      <p v-if="loading" role="status" class="empty">Finding the timetable…</p>
      <div v-else-if="error" class="empty" role="alert">
        <p>The timetable couldn’t load.</p>
        <button type="button" @click="load">Try again</button>
      </div>
      <p v-else-if="!listings.length" class="empty">
        A timetable isn’t available for this channel yet.
      </p>
      <ol v-else class="listings">
        <li
          v-for="(programme, index) in listings"
          :key="`${programme.videoId}-${programme.startsAt}`"
          :class="{ 'on-now': index === 0 }"
        >
          <div class="airtime">
            <span
              v-if="index === 0 || day(programme.startsAt) !== day(listings[index - 1]!.startsAt)"
              class="day"
              >{{ day(programme.startsAt) }}</span
            ><time :datetime="new Date(programme.startsAt * 1000).toISOString()">{{
              time(programme.startsAt)
            }}</time
            ><span class="end-time">to {{ time(programme.endsAt) }}</span>
          </div>
          <div class="programme">
            <span v-if="index === 0" class="live">On now</span>
            <h3>{{ programme.title || 'Untitled programme' }}</h3>
            <p>{{ programmeDuration(programme.durationSeconds) }}</p>
          </div>
        </li>
      </ol>
      <p class="footnote">
        Times are shown in your local timezone. Programmes may change if a video becomes
        unavailable.
      </p>
    </section>
  </main>
</template>

<style scoped>
.schedule-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 5vw, 3rem) 4rem;
  color: var(--crt-cream);
}
.masthead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #445443;
  font-size: 0.8rem;
}
a {
  color: var(--crt-phosphor);
  text-underline-offset: 0.25em;
}
.brand {
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}
.intro {
  padding: 3.5rem 0 2rem;
}
.eyebrow {
  color: var(--crt-phosphor);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.7rem;
}
h1 {
  margin: 0.6rem 0;
  font-size: clamp(2rem, 7vw, 4rem);
  font-weight: 500;
  letter-spacing: -0.06em;
}
.intro > p:last-child,
.time-note,
.footnote {
  color: #b1bca9;
  font-size: 0.8rem;
  line-height: 1.8;
}
.channel-picker {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1rem;
  padding: 1.25rem;
  background: #1b251c;
  border: 1px solid #465943;
}
.channel-picker > div {
  min-width: 0;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}
input,
select {
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  padding: 0.7rem;
  border: 1px solid #607059;
  border-radius: 2px;
  color: var(--crt-cream);
  background: #0d170e;
  font: inherit;
  font-size: 0.8rem;
}
.no-matches {
  margin: 0;
  font-size: 0.8rem;
}
.station-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
}
h2 {
  margin: 0.5rem 0;
  font-size: clamp(1.3rem, 4vw, 2rem);
}
.watch-link {
  flex-shrink: 0;
  font-size: 0.8rem;
  padding: 0.75rem 0;
}
.time-note {
  padding-bottom: 1rem;
  border-bottom: 1px solid #607059;
}
.listings {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #344332;
}
li.on-now {
  background: #233020;
  border-left: 3px solid var(--crt-phosphor);
  padding-left: calc(1rem - 3px);
}
.airtime {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
}
.day,
.end-time {
  color: #b1bca9;
  font-size: 0.7rem;
}
.day {
  margin-bottom: 0.3rem;
}
h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.programme p {
  margin: 0.5rem 0 0;
  color: #b1bca9;
  font-size: 0.75rem;
}
.live {
  display: inline-block;
  margin-bottom: 0.6rem;
  color: var(--crt-phosphor);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.65rem;
}
.live::before {
  content: '●';
  margin-right: 0.5rem;
}
.empty {
  padding: 2rem 0;
}
button {
  background: #233020;
  color: var(--crt-cream);
  border: 1px solid #607059;
  padding: 0.7rem 1rem;
  font: inherit;
  cursor: pointer;
}
.footnote {
  margin-top: 1.5rem;
}
:focus-visible {
  outline: 3px solid var(--crt-cream);
  outline-offset: 4px;
}
@media (max-width: 540px) {
  .channel-picker {
    grid-template-columns: 1fr;
  }
  .station-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }
  li {
    grid-template-columns: 85px 1fr;
    gap: 0.8rem;
    padding-right: 0.4rem;
  }
  .intro {
    padding-top: 2rem;
  }
}
</style>
