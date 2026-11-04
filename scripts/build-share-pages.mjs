import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHANNELS, formatChannelNumber } from '../src/data/channels.ts'
import { channelShareCard } from '../src/lib/channelShareCard.ts'

const origin = 'https://www.1988.in'
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  )

export function renderChannelPage(template, channel) {
  const title = channel
    ? `CH ${formatChannelNumber(channel.number)} ${channel.name} - 1988.in`
    : '1988.in — Come back to a simpler time.'
  const description =
    channel?.blurb ||
    'The programme is already on. Change the channel, or stay with it. Come back to a simpler time.'
  const url = `${origin}/watch${channel ? `?channel=${channel.number}` : ''}`
  const card = channelShareCard(channel)
  const meta = (attribute, name, content) =>
    `<meta ${attribute}="${name}" content="${escape(content)}" />`
  // Replace, rather than append: crawlers may choose the first image or title.
  const clean = template
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(
      /<meta\b[^>]*(?:property|name)=["'](?:og:[^"']*|twitter:[^"']*|description)["'][^>]*>/gi,
      '',
    )
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
  return clean.replace(
    '</head>',
    [
      `<title>${escape(title)}</title>`,
      `<link rel="canonical" href="${escape(url)}" />`,
      meta('name', 'description', description),
      meta('property', 'og:site_name', '1988.in'),
      meta('property', 'og:locale', 'en_IN'),
      meta('property', 'og:type', 'website'),
      meta('property', 'og:url', url),
      meta('property', 'og:title', title),
      meta('property', 'og:description', description),
      meta('property', 'og:image', `${origin}/${card.path}`),
      meta('property', 'og:image:type', 'image/png'),
      meta('property', 'og:image:width', '1200'),
      meta('property', 'og:image:height', '630'),
      meta('property', 'og:image:alt', card.alt),
      meta('name', 'twitter:card', 'summary_large_image'),
      meta('name', 'twitter:title', title),
      meta('name', 'twitter:description', description),
      meta('name', 'twitter:image', `${origin}/${card.path}`),
      meta('name', 'twitter:image:alt', card.alt),
      '</head>',
    ].join('\n    '),
  )
}

export async function buildSharePages(dist = new URL('../dist/', import.meta.url)) {
  const template = await readFile(new URL('index.html', dist), 'utf8')
  const directory = new URL('share-pages/', dist)
  await mkdir(directory, { recursive: true })
  await writeFile(new URL('fallback.html', directory), renderChannelPage(template))
  await Promise.all(
    CHANNELS.map(async (channel) => {
      // Fail the build rather than ship a broken preview image.
      await readFile(new URL(channelShareCard(channel).path, dist))
      await writeFile(
        new URL(`${channel.number}.html`, directory),
        renderChannelPage(template, channel),
      )
    }),
  )
  console.log(`Built sharing metadata for ${CHANNELS.length} channels.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSharePages()
}
