import { describe, it, expect } from 'vitest'
import {
  CHANNELS,
  CHANNEL_COUNT,
  CHANNEL_DIGITS,
  channelByNumber,
  formatChannelLabel,
  formatChannelNumber,
} from '../data/channels'

describe('channel lineup', () => {
  it('uses a curated Formula schedule instead of the failing uploads feed', async () => {
    const formula = CHANNELS.find((channel) => channel.name === 'Formula')!
    expect(formula.kind).toBe('curated')
    expect((await formula.loadCuratedCatalog!()).length).toBeGreaterThanOrEqual(3)
  })
  it('sources football across competitions instead of a single league playlist', () => {
    const football = CHANNELS.find((channel) => channel.name === 'Football')!
    expect(football.kind).toBe('curated')
    expect(football.playlistId).toBeUndefined()
    expect(football.query).toContain('club international')
  })
  it('has at least 100 contiguous channels', () => {
    expect(CHANNEL_COUNT).toBeGreaterThanOrEqual(100)
    expect(CHANNELS).toHaveLength(CHANNEL_COUNT)
    expect(CHANNELS.map((channel) => channel.number)).toEqual(
      Array.from({ length: CHANNEL_COUNT }, (_, i) => i + 1),
    )
  })

  it('gives every channel a unique name and source policy, plus a blurb, mood, and category', () => {
    const names = CHANNELS.map((channel) => channel.name)
    const playlists = CHANNELS.map((channel) =>
      JSON.stringify([channel.playlistId ?? channel.query, channel.titleTerms ?? []]),
    )
    expect(new Set(names).size).toBe(CHANNEL_COUNT)
    expect(new Set(playlists).size).toBe(CHANNEL_COUNT)
    for (const channel of CHANNELS) {
      expect(['playlist', 'curated', 'search']).toContain(channel.kind)
      if (!channel.playlistId) {
        expect(channel.query?.length).toBeGreaterThan(0)
      } else {
        expect(channel.playlistId).toMatch(/^(PL|UU)[\w-]{10,}$/)
      }
      expect(channel.blurb?.length).toBeGreaterThan(12)
      expect(['calm', 'warm', 'bright', 'curious']).toContain(channel.mood)
      expect(channel.category?.length).toBeGreaterThan(2)
    }
  })

  it('pads labels to the width of the last channel', () => {
    expect(CHANNEL_DIGITS).toBe(String(CHANNEL_COUNT).length)
    expect(formatChannelNumber(1)).toBe('1'.padStart(CHANNEL_DIGITS, '0'))
    expect(formatChannelLabel(channelByNumber(9)!)).toBe(
      `CH ${formatChannelNumber(9)}  STREET FOOD`,
    )
  })
})

it('tags every channel and keeps the DD lineup discoverable', () => {
  for (const channel of CHANNELS) {
    expect(channel.tags.length).toBeGreaterThanOrEqual(2)
    expect(new Set(channel.tags).size).toBe(channel.tags.length)
  }
  const classics = CHANNELS.filter((channel) => channel.tags.includes('DD Era'))
  expect(classics.map((channel) => channel.name)).toEqual([
    'Jungle Book',
    'Shaktimaan',
    'DD Classics',
    'Ramayan',
    'Mahabharat',
    'Vintage India',
  ])
  expect(classics.map((channel) => channel.number)).toEqual([3, 4, 5, 6, 7, 13])
})

it('gives DD Classics a month of distinct programming across the requested shows', async () => {
  const channel = channelByNumber(5)!
  const items = await channel.loadCuratedCatalog!()
  expect(items.reduce((seconds, item) => seconds + item.durationSeconds, 0)).toBeGreaterThanOrEqual(
    30 * 86400,
  )
  expect(new Set(items.map((item) => item.videoId)).size).toBe(items.length)
  for (const series of [
    'Surabhi',
    'Vikram Aur Betaal',
    'Shri Krishna',
    'Malgudi Days',
    'Dekh Bhai Dekh',
    'Flop Show',
    'Wagle Ki Duniya',
    'Byomkesh Bakshi',
    'Fauji',
    'Circus',
    'Bharat Ek Khoj',
    'Alice in Wonderland',
    'Potli Baba Ki',
    'Vintage ads',
  ]) {
    expect(
      items.some((item) => item.title?.startsWith(`${series} —`)),
      series,
    ).toBe(true)
  }
})

it('replaces Channel 013 with a curated mix of vintage ads and public-service interludes', async () => {
  const channel = channelByNumber(13)!
  expect(channel.name).toBe('Vintage India')
  expect(channel.kind).toBe('curated')
  expect(channel.playlistId).toBeUndefined()
  const items = await channel.loadCuratedCatalog!()
  expect(items.length).toBeGreaterThan(100)
  expect(new Set(items.map((item) => item.videoId)).size).toBe(items.length)
  for (const category of [
    'Public service & broadcast',
    'Transport, clothing & electronics',
    'Food & drink',
    'Household, personal care & health',
  ]) {
    expect(
      items.some((item) => item.title?.startsWith(`${category} —`)),
      category,
    ).toBe(true)
  }
  expect(items.some((item) => item.durationSeconds < 60)).toBe(true)
  expect(items.some((item) => /SoulPancake|Rainn Wilson/.test(item.title ?? ''))).toBe(false)
})
