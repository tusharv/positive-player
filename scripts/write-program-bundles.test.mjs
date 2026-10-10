import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { writeProgramBundles } from './write-program-bundles.mjs'

test('generated index loads only the requested channel and versions content changes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'player-bundles-'))
  const directory = pathToFileURL(`${root}/`)
  const channels = [
    { number: 1, name: 'One' },
    { number: 2, name: 'Two' },
  ]
  const catalogs = {
    One: [{ videoId: 'first-video', durationSeconds: 600, title: 'First' }],
    Two: [{ videoId: 'other-video', durationSeconds: 120, title: 'Other' }],
  }
  const server = await createServer({
    root,
    configFile: false,
    server: { middlewareMode: true },
    appType: 'custom',
  })
  // Execute Vite's JavaScript modules with native MIME enforcement. A JSON
  // assertion must fail here just as it does against Vite's dev-server response.
  async function loadManifest() {
    server.moduleGraph.invalidateAll()
    const manifest = await server.transformRequest('/curatedPrograms.ts')
    const program = await server.transformRequest('/programs/001.json?import')
    const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(program.code).toString('base64')
    const code = manifest.code.replace(
      /(["'])[^"']*programs\/001\.json[^"']*\1/g,
      JSON.stringify(moduleUrl),
    )
    return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
  }
  try {
    writeProgramBundles(channels, catalogs, directory)
    // Two's browser URL stays unresolved in Node: loading One must be lazy.
    const { CURATED_PROGRAMS: initial } = await loadManifest()
    assert.deepEqual(await initial.One.load(), catalogs.One)
    writeProgramBundles(
      channels,
      { ...catalogs, One: [{ ...catalogs.One[0], durationSeconds: 900 }] },
      directory,
    )
    const { CURATED_PROGRAMS: updated } = await loadManifest()
    assert.notEqual(updated.One.version, initial.One.version)
    assert.equal(updated.Two.version, initial.Two.version)
    const previous = readFileSync(new URL('curatedPrograms.ts', directory), 'utf8')
    assert.throws(
      () => writeProgramBundles(channels, { One: catalogs.One }, directory),
      /Missing bundle: Two/,
    )
    assert.equal(readFileSync(new URL('curatedPrograms.ts', directory), 'utf8'), previous)
  } finally {
    await server.close()
    rmSync(root, { recursive: true, force: true })
  }
})

test('regenerating DD Classics preserves its full curated month instead of restoring the old seed', async () => {
  const { HAND_PICKED_PROGRAMS } = await import('../src/data/handPickedPrograms.ts')
  const root = mkdtempSync(join(tmpdir(), 'dd-classics-bundle-'))
  try {
    writeProgramBundles(
      [{ number: 5, name: 'DD Classics' }],
      HAND_PICKED_PROGRAMS,
      pathToFileURL(`${root}/`),
    )
    const items = JSON.parse(readFileSync(join(root, 'programs/005.json'), 'utf8'))
    assert.ok(items.reduce((seconds, item) => seconds + item.durationSeconds, 0) >= 30 * 86400)
    assert.ok(items.some((item) => item.title.startsWith('Surabhi —')))
    assert.ok(items.some((item) => item.title.startsWith('Vintage ads —')))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('regenerating Channel 013 preserves the vintage selection and all four categories', async () => {
  const { HAND_PICKED_PROGRAMS } = await import('../src/data/handPickedPrograms.ts')
  const root = mkdtempSync(join(tmpdir(), 'vintage-india-bundle-'))
  try {
    writeProgramBundles(
      [{ number: 13, name: 'Vintage India' }],
      HAND_PICKED_PROGRAMS,
      pathToFileURL(`${root}/`),
    )
    const items = JSON.parse(readFileSync(join(root, 'programs/013.json'), 'utf8'))
    assert.ok(items.length > 100)
    for (const category of [
      'Public service & broadcast',
      'Transport, clothing & electronics',
      'Food & drink',
      'Household, personal care & health',
    ]) {
      assert.ok(items.some((item) => item.title.startsWith(`${category} —`)))
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('refuses to publish Bollywood audio or unreviewed mixes', () => {
  const root = mkdtempSync(join(tmpdir(), 'bollywood-video-policy-'))
  try {
    for (const title of ['Audio Jukebox', 'Official Lyric Video', 'Non Stop Hits']) {
      assert.throws(
        () =>
          writeProgramBundles(
            [{ number: 1, name: 'Bollywood' }],
            { Bollywood: [{ videoId: 'example', title, durationSeconds: 600 }] },
            pathToFileURL(`${root}/`),
          ),
        /requires video songs/,
      )
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
