import { writeFileSync } from 'node:fs'
import { CHANNELS } from '../src/data/channels.ts'
import { HAND_PICKED_PROGRAMS } from '../src/data/handPickedPrograms.ts'
import { writeProgramBundles } from './write-program-bundles.mjs'
import { fetchChannelCatalog } from '../src/lib/youtubeData.ts'

// Run explicitly to refresh the checked-in lists; never runs during a site build.
try {
  process.loadEnvFile('.env.local')
} catch {
  /* An exported key also works. */
}
const apiKey = process.env.VITE_YOUTUBE_API_KEY
if (!apiKey) throw new Error('Set VITE_YOUTUBE_API_KEY before generating catalogs')
const referer = process.env.YOUTUBE_REFERER ?? 'https://www.1988.in/'
const catalogs = { ...HAND_PICKED_PROGRAMS }
const failures = []
let requests = 0
const fetchFn = (url) => {
  requests++
  return fetch(url, { headers: { Referer: referer }, signal: AbortSignal.timeout(20000) })
}

async function collect(channel) {
  if (HAND_PICKED_PROGRAMS[channel.name]) return
  const source = { ...channel, kind: channel.playlistId ? 'playlist' : 'search' }
  try {
    let items = await fetchChannelCatalog(source, { apiKey, fetchFn })
    // A missing/empty playlist may be replaced only by the station's own topic.
    if (items.length < 3 && source.kind === 'playlist') {
      items = await fetchChannelCatalog({ ...source, kind: 'search' }, { apiKey, fetchFn })
    }
    if (items.length < 3) throw new Error(`Only ${items.length} playable programmes`)
    catalogs[channel.name] = items.slice(0, 50)
    console.log(`${channel.number} ${channel.name}: ${catalogs[channel.name].length}`)
  } catch (error) {
    failures.push(`${channel.name}: ${error.message}`)
  }
}

const pending = [...CHANNELS]
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (pending.length) await collect(pending.shift())
  }),
)

if (failures.length) {
  // Keep successful collection available for diagnosis, without replacing the bundle.
  writeFileSync(
    new URL('../.bundled-programs-partial.json', import.meta.url),
    JSON.stringify(catalogs),
  )
  throw new Error(`Bundle unchanged. ${failures.join('; ')}`)
}
writeProgramBundles(CHANNELS, catalogs, new URL('../src/data/', import.meta.url))
console.log(`Bundled ${Object.keys(catalogs).length} stations; ${requests} API requests.`)
