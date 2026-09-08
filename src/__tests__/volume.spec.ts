import { describe, it, expect } from 'vitest'
import { createVolumeState, stepVolume, toggleMute } from '../lib/volume'

describe('volume', () => {
  it('steps up five from 80 to 85', () => {
    expect(stepVolume(createVolumeState(80), 5).volume).toBe(85)
  })

  it('clamps up at 100', () => {
    expect(stepVolume(createVolumeState(100), 5).volume).toBe(100)
  })

  it('clamps down at 0 and mutes', () => {
    const next = stepVolume(createVolumeState(5, false, 5), -5)
    expect(next.volume).toBe(0)
    expect(next.muted).toBe(true)
  })

  it('keeps last level when muted', () => {
    const muted = toggleMute(createVolumeState(80, false))
    expect(muted.muted).toBe(true)
    expect(muted.volume).toBe(80)
  })

  it('restores last non-zero on unmute', () => {
    const muted = toggleMute(createVolumeState(80, false))
    const unmuted = toggleMute(muted)
    expect(unmuted.muted).toBe(false)
    expect(unmuted.volume).toBe(80)
  })

  it('unmutes and steps up when raising while muted', () => {
    const next = stepVolume(createVolumeState(80, true, 80), 5)
    expect(next.muted).toBe(false)
    expect(next.volume).toBe(85)
  })
})
