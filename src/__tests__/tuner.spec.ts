import { describe, it, expect } from 'vitest'
import { CHANNEL_COUNT } from '../data/channels'
import { wrapChannel, createDigitState, pushDigit, flushDigits } from '../lib/tuner'

function typeDigits(digits: string, start = 0) {
  let result = { state: createDigitState(), channel: null as number | null }
  for (const [i, digit] of [...digits].entries()) {
    result = pushDigit(result.state, digit, start + i * 200)
  }
  return result
}

describe('wrapChannel', () => {
  it('wraps the last channel plus one to 1', () => {
    expect(wrapChannel(CHANNEL_COUNT, 1)).toBe(1)
  })

  it('wraps 1 minus one to the last channel', () => {
    expect(wrapChannel(1, -1)).toBe(CHANNEL_COUNT)
  })
})

describe('digit entry', () => {
  it('tunes 003 as channel 3', () => {
    const typed = typeDigits('003')
    expect(typed.channel).toBe(3)
  })

  it('tunes 011 as Bollywood', () => {
    expect(typeDigits('011').channel).toBe(11)
  })

  it('tunes 100 when that channel exists', () => {
    expect(typeDigits('100').channel).toBe(100)
  })

  it('tunes lone 3 after the commit window', () => {
    const first = pushDigit(createDigitState(), '3', 0)
    expect(first.channel).toBeNull()
    const flushed = flushDigits(first.state, 1300)
    expect(flushed.channel).toBe(3)
  })

  it('tunes 03 after the commit window', () => {
    const typed = typeDigits('03')
    expect(typed.channel).toBeNull()
    expect(flushDigits(typed.state, 1600).channel).toBe(3)
  })

  it('ignores 999', () => {
    expect(typeDigits('999').channel).toBeNull()
  })
})
