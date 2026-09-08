import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    }),
)

const key = env.VITE_YOUTUBE_API_KEY
if (!key) {
  console.error('Missing VITE_YOUTUBE_API_KEY')
  process.exit(1)
}

/** @type {Record<string, string[]>} */
const HANDLES = {
  Nature: ['BBCEarth'],
  Ocean: ['MBARIVideo'],
  Animals: ['LoveNature'],
  Lofi: ['LofiGirl'],
  Talks: ['TED'],
  Space: ['NASA'],
  Kitchen: ['bingingwithbabish'],
  Craft: ['ILikeToMakeStuff'],
  'Classic Music': ['SmithsonianFolkways'],
  'Good News': ['thehappybroadcast'],
  Bollywood: ['TSeries'],
  Cricket: ['icc'],
  Rain: ['RelaxingWhiteNoise'],
  Fireplace: ['TheFireplace4K'],
  Forest: ['NomadicAmbience'],
  Mountains: ['AmazingPlacesOnOurPlanet'],
  Desert: ['Desert4K'],
  River: ['NatureRelaxationFilms'],
  Falls: ['NiagaraFalls'],
  Snow: ['ScenicRelaxationFilm'],
  Aurora: ['Travel8K'],
  Clouds: ['TimestormFilms'],
  Stars: ['NASAGoddard'],
  Aquarium: ['MontereyBayAquarium'],
  Birds: ['CornellLab'],
  Whales: ['NaturalWorldFacts'],
  Cats: ['WildEarth'],
  Dogs: ['TheDodo'],
  Horses: ['FEIChannel'],
  Pandas: ['iPandaOfficial'],
  Bees: ['BeeFriendly'],
  Farm: ['LivingTraditionally'],
  Safari: ['LatestSightings'],
  Reef: ['ReefLife'],
  Piano: ['RelaxingPianoMusic'],
  Guitar: ['SunghaJung'],
  Violin: ['TwoSetViolin'],
  Choir: ['VOCES8'],
  Ambient: ['SoothingRelaxation'],
  Soul: ['StaxRecords'],
  Blues: ['crossroadsguitar'],
  Reggae: ['BobMarley'],
  Bossa: ['BossaNova'],
  Flamenco: ['PacoPena'],
  Gospel: ['BETNetworks'],
  Disco: ['NileRodgersOfficial'],
  Funk: ['JamesBrownOfficial'],
  Score: ['HansZimmer'],
  Celtic: ['celticwoman'],
  Sitar: ['DarbarFestival'],
  Kora: ['kora'],
  Fado: ['Mariza'],
  Gagaku: ['NHKWORLDJAPAN'],
  Mariachi: ['mariachimusic'],
  Highlife: ['GhanaMusic'],
  Gamelan: ['IndonesianCulture'],
  Opera: ['LaScala'],
  Harp: ['CelticHarp'],
  Flute: ['NativeAmericanFlute'],
  Organ: ['cathedralorgan'],
  Baking: ['JoshuaWeissman'],
  Coffee: ['jameshoffmann'],
  Tea: ['MeiLeaf'],
  Pasta: ['vincenzosplate'],
  'Street Food': ['BestEverFoodReviewShow'],
  Clay: ['FlorianGadsby'],
  Wood: ['MattEstlea'],
  Glass: ['CorningMuseumOfGlass'],
  Ink: ['JapaneseCalligraphy'],
  Paint: ['officialbobross'],
  Yarn: ['VeryPinkKnits'],
  Paper: ['JoNakashima'],
  Tokyo: ['Rambalac'],
  Paris: ['WalkingParis'],
  Venice: ['venezia'],
  Kyoto: ['googleartsculture'],
  Marrakech: ['WalkWithMe4K'],
  Havana: ['HavanaCuba'],
  Seoul: ['SeoulWalk'],
  Cairo: ['EgyptWalks'],
  Andes: ['PeruWalks'],
  Iceland: ['VisitIceland'],
  Kerala: ['KeralaTourism'],
  Lisbon: ['VisitPortugal'],
  Yoga: ['yogawithadriene'],
  Still: ['TheHonestGuys'],
  'Tai Chi': ['TaiChi'],
  Museum: ['MuseeLouvre'],
  Buildings: ['Dezeen'],
  History: ['TimelineChannel'],
  Rocks: ['eons'],
  Words: ['EasyLanguages'],
  Chess: ['chess'],
  Gardens: ['GardenAnswer'],
  Trains: ['RailCowGirl'],
  Sailing: ['SailingLaVagabonde'],
  Tennis: ['ATPTour'],
  Football: ['FIFA'],
  Formula: ['Formula1'],
  Olympics: ['Olympics'],
  Hoops: ['NBA'],
  Peloton: ['letourdefrance'],
  Ice: ['USFigureskating'],
  Surf: ['RedBullSurfing'],
  Trail: ['AllTrails'],
  Camp: ['OutdoorBoys'],
  Library: ['NYPL'],
  Bookshop: ['PowellsBooks'],
  Vinyl: ['VinylCommunity'],
  Dawn: ['Sunsets'],
  Dusk: ['GoldenHour4K'],
  Storm: ['PecosHank'],
  Wind: ['NatureSoundscapes'],
  Market: ['MarkWiens'],
  Festival: ['NatGeo'],
  Dance: ['DanceOn'],
  Circus: ['CirqueDuSoleil'],
  Puppets: ['TheMuppetsStudio'],
  Kindness: ['SoulPancake'],
  Lakes: ['CalmLakes'],
  'DD Classics': ['DoordarshanNational'],
  Ramayan: ['Rajshri'],
  Mahabharat: ['SETIndia'],
  'Jungle Book': ['CartoonNetworkIndia'],
  Shaktimaan: ['Shemaroo'],
}

async function resolveHandle(handle) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.set('part', 'contentDetails,snippet')
  url.searchParams.set('forHandle', handle.startsWith('@') ? handle : `@${handle}`)
  url.searchParams.set('key', key)
  const response = await fetch(url, {
    headers: {
      Referer: 'https://positive-player.vercel.app/',
      Origin: 'https://positive-player.vercel.app',
    },
  })
  const body = await response.json()
  if (!response.ok) {
    return { error: body.error?.message ?? `HTTP ${response.status}` }
  }
  const item = body.items?.[0]
  if (!item) return { error: 'not found' }
  const playlistId = item?.contentDetails?.relatedPlaylists?.uploads
  const title = item?.snippet?.title
  const channelId = item?.id
  if (!playlistId) return { error: `no uploads playlist (${title ?? channelId})` }
  return { playlistId, title, channelId, handle }
}

const used = new Set()
const results = {}
const failures = []

for (const [name, handles] of Object.entries(HANDLES)) {
  let found = null
  const errors = []
  for (const handle of handles) {
    const resolved = await resolveHandle(handle)
    if (resolved.error) {
      errors.push(`${handle}: ${resolved.error}`)
      continue
    }
    if (used.has(resolved.playlistId)) {
      errors.push(`${handle}: duplicate ${resolved.playlistId}`)
      continue
    }
    found = resolved
    break
  }
  if (!found) {
    failures.push({ name, errors })
    continue
  }
  used.add(found.playlistId)
  results[name] = found
  console.error(`ok ${name} -> ${found.handle} (${found.title}) ${found.playlistId}`)
}

console.log(JSON.stringify({ results, failures }, null, 2))
console.error(`\nResolved ${Object.keys(results).length}, failed ${failures.length}`)
