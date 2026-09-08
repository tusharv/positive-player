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
  it('has at least 100 contiguous channels', () => {
    expect(CHANNEL_COUNT).toBeGreaterThanOrEqual(100)
    expect(CHANNELS).toHaveLength(CHANNEL_COUNT)
    expect(CHANNELS.map((channel) => channel.number)).toEqual(
      Array.from({ length: CHANNEL_COUNT }, (_, i) => i + 1),
    )
  })

  it('gives every channel a unique name, search query, blurb, mood, and category', () => {
    const names = CHANNELS.map((channel) => channel.name)
    const queries = CHANNELS.map((channel) => channel.query)
    expect(new Set(names).size).toBe(CHANNEL_COUNT)
    expect(new Set(queries).size).toBe(CHANNEL_COUNT)
    for (const channel of CHANNELS) {
      expect(channel.kind).toBe('search')
      expect(channel.query?.length).toBeGreaterThan(8)
      expect(channel.blurb?.length).toBeGreaterThan(12)
      expect(['calm', 'warm', 'bright', 'curious']).toContain(channel.mood)
      expect(channel.category?.length).toBeGreaterThan(2)
    }
  })

  it('pads labels to the width of the last channel', () => {
    expect(CHANNEL_DIGITS).toBe(String(CHANNEL_COUNT).length)
    expect(formatChannelNumber(1)).toBe('1'.padStart(CHANNEL_DIGITS, '0'))
    expect(formatChannelLabel(channelByNumber(9)!)).toBe(
      `CH ${formatChannelNumber(9)}  CLASSIC MUSIC`,
    )
  })
})

it('tags every channel and appends the DD lineup without moving old channels', () => {
  for (const channel of CHANNELS) {
    expect(channel.tags.length).toBeGreaterThanOrEqual(2)
    expect(new Set(channel.tags).size).toBe(channel.tags.length)
  }
  expect(channelByNumber(120)?.name).toBe('Lakes')
  expect(CHANNELS.slice(120).map((channel) => channel.name)).toEqual([
    'DD Classics',
    'Ramayan',
    'Mahabharat',
    'Jungle Book',
    'Shaktimaan',
  ])
  expect(CHANNELS.slice(120).every((channel) => channel.tags.includes('DD Era'))).toBe(true)
})
