import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
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
  try {
    writeProgramBundles(channels, catalogs, directory)
    // Importing the index and loading One must not need Two's file at all.
    rmSync(new URL('programs/002.json', directory))
    const { CURATED_PROGRAMS: initial } = await import(new URL('curatedPrograms.ts', directory))
    assert.deepEqual(await initial.One.load(), catalogs.One)
    writeProgramBundles(
      channels,
      { ...catalogs, One: [{ ...catalogs.One[0], durationSeconds: 900 }] },
      directory,
    )
    const { CURATED_PROGRAMS: updated } = await import(
      new URL('curatedPrograms.ts?updated', directory)
    )
    assert.notEqual(updated.One.version, initial.One.version)
    assert.equal(updated.Two.version, initial.Two.version)
    const previous = readFileSync(new URL('curatedPrograms.ts', directory), 'utf8')
    assert.throws(
      () => writeProgramBundles(channels, { One: catalogs.One }, directory),
      /Missing bundle: Two/,
    )
    assert.equal(readFileSync(new URL('curatedPrograms.ts', directory), 'utf8'), previous)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
