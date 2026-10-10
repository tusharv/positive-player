import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { archiveCatalogs, mergeCatalog, auditCatalog, WEEK_SECONDS } from './weekly-catalog.mjs'

test('coverage counts unique valid videos, never duplicate padding', () => {
  const items = [
    { videoId: 'one', durationSeconds: WEEK_SECONDS - 10 },
    { videoId: 'one', durationSeconds: WEEK_SECONDS - 10 },
    { videoId: 'bad', durationSeconds: -1 },
  ]
  const audit = auditCatalog(items)
  assert.equal(audit.seconds, WEEK_SECONDS - 10)
  assert.equal(audit.missingSeconds, 10)
  assert.equal(audit.ready, false)
  assert.equal(audit.duplicates, 1)
})

test('fresh videos lead, existing entries remain and updated durations win', () => {
  const old = [{ videoId: 'old', durationSeconds: 20, title: 'Editorial title' }]
  const fresh = [
    { videoId: 'old', durationSeconds: 25, title: 'Publisher title' },
    { videoId: 'new', durationSeconds: 30 },
  ]
  assert.deepEqual(mergeCatalog(old, fresh), [fresh[1], { ...old[0], durationSeconds: 25 }])
})

test('archive retains complete lists and refuses to overwrite history', () => {
  const root = mkdtempSync(join(tmpdir(), 'weekly-archive-'))
  try {
    const channels = [{ number: 1, name: 'One', playlistId: 'source' }]
    const catalogs = { One: [{ videoId: 'past', title: 'Past', durationSeconds: 12 }] }
    archiveCatalogs(root, '2026-10-10', channels, catalogs)
    const archived = readFileSync(join(root, '2026-10-10/catalogs.json'), 'utf8')
    assert.deepEqual(JSON.parse(archived), catalogs)
    assert.throws(() => archiveCatalogs(root, '2026-10-10', channels, { One: [] }), /exist/i)
    assert.equal(readFileSync(join(root, '2026-10-10/catalogs.json'), 'utf8'), archived)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('only schedules public, embeddable, finished, region-available videos matching the topic', async () => {
  const { catalogItemFromVideo } = await import('./weekly-catalog.mjs')
  const video = {
    id: 'nature',
    snippet: { title: 'Forest walk', liveBroadcastContent: 'none' },
    status: { privacyStatus: 'public', embeddable: true },
    contentDetails: { duration: 'PT1H' },
  }
  const options = { titleTerms: ['forest'] }
  assert.equal(catalogItemFromVideo(video, options).durationSeconds, 3600)
  assert.equal(
    catalogItemFromVideo({ ...video, status: { ...video.status, embeddable: false } }, options),
    null,
  )
  assert.equal(
    catalogItemFromVideo(
      { ...video, status: { ...video.status, privacyStatus: 'private' } },
      options,
    ),
    null,
  )
  assert.equal(
    catalogItemFromVideo(
      { ...video, snippet: { ...video.snippet, liveBroadcastContent: 'live' } },
      options,
    ),
    null,
  )
  assert.equal(
    catalogItemFromVideo(
      { ...video, contentDetails: { duration: 'PT1H', regionRestriction: { blocked: ['IN'] } } },
      options,
    ),
    null,
  )
  assert.equal(
    catalogItemFromVideo(
      { ...video, contentDetails: { duration: 'PT1H', regionRestriction: { allowed: ['US'] } } },
      options,
    ),
    null,
  )
  assert.equal(
    catalogItemFromVideo(
      {
        ...video,
        contentDetails: { duration: 'PT1H', contentRating: { ytRating: 'ytAgeRestricted' } },
      },
      options,
    ),
    null,
  )
  assert.equal(catalogItemFromVideo(video, { titleTerms: ['desert'] }), null)
})

test('Bollywood requires video songs and rejects audio, lyric videos, and ambiguous mixes', async () => {
  const { catalogItemFromVideo } = await import('./weekly-catalog.mjs')
  const base = {
    id: 'song',
    status: { privacyStatus: 'public', embeddable: true },
    contentDetails: { duration: 'PT5M' },
  }
  const options = { channelName: 'Bollywood' }
  for (const title of [
    'Bollywood Audio Jukebox',
    'Song (Official Lyric Video)',
    'Official Audio Video',
    'Song Visualizer Video',
    'Non Stop Bollywood Hits',
    'Song instrumental video',
  ]) {
    assert.equal(catalogItemFromVideo({ ...base, snippet: { title } }, options), null, title)
  }
  for (const title of [
    'Bollywood Video Jukebox',
    'Full Video Song | Film',
    'Official Music Video',
    'Bollywood Video Songs',
  ]) {
    assert.ok(catalogItemFromVideo({ ...base, snippet: { title } }, options), title)
  }
  assert.ok(
    catalogItemFromVideo({ ...base, snippet: { title: 'Audio Jukebox' } }, { channelName: 'Soul' }),
  )
})
