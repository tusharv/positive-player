import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { CHANNELS } from '../src/data/channels.ts'
import { renderChannelPage } from './build-share-pages.mjs'

const template = await readFile(new URL('../index.html', import.meta.url), 'utf8')

test('each of the first ten channels has one distinct social image in raw HTML', () => {
  const images = new Set()
  for (const channel of CHANNELS.slice(0, 10)) {
    const html = renderChannelPage(template, channel)
    const image = html.match(/property="og:image" content="([^"]+)"/g)
    assert.equal(image.length, 1)
    images.add(image[0])
    assert.ok(html.includes(`?channel=${channel.number}`))
    assert.ok(html.includes(`${channel.name} - 1988.in</title>`))
    assert.ok(html.includes('content="1200"'))
    assert.ok(html.includes('content="630"'))
    assert.ok(html.includes('<div id="app"></div>'))
    assert.ok(!html.includes('/images/poster-'))
  }
  assert.equal(images.size, 10)
})

test('later channels keep their own title and URL but share the fallback image', () => {
  for (const channel of CHANNELS.slice(10)) {
    const html = renderChannelPage(template, channel)
    assert.ok(html.includes('https://www.1988.in/share-cards/fallback.png'))
    assert.ok(html.includes(`${channel.name} - 1988.in</title>`))
    assert.ok(html.includes(`https://www.1988.in/watch?channel=${channel.number}`))
  }
})

test('generic watch page uses the fallback and metadata is escaped', () => {
  const html = renderChannelPage(template)
  assert.ok(html.includes('/share-cards/fallback.png'))
  assert.ok(html.includes('href="https://www.1988.in/watch"'))
  const escaped = renderChannelPage(template, {
    number: 99,
    name: '<Hello & "world">',
    blurb: 'A "quote" & more',
  })
  assert.ok(escaped.includes('&lt;Hello &amp; &quot;world&quot;&gt;'))
  assert.ok(!escaped.includes('<Hello'))
})
