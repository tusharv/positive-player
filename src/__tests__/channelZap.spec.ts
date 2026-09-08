import { describe, it, expect } from 'vitest'
import { channelZapNeeded, CHANNEL_ZAP_MS } from '../lib/channelZap'

describe('channelZapNeeded', () => {
  it('zaps when the set is on and the channel actually changes', () => {
    expect(channelZapNeeded(3, 4, true)).toBe(true)
  })

  it('does not zap when landing on the same channel', () => {
    expect(channelZapNeeded(3, 3, true)).toBe(false)
  })

  it('does not zap before the set is on', () => {
    expect(channelZapNeeded(1, 2, false)).toBe(false)
  })

  it('keeps the burst long enough to read as analog snow', () => {
    expect(CHANNEL_ZAP_MS).toBeGreaterThanOrEqual(300)
  })
})
