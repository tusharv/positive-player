export type VolumeState = {
  volume: number
  muted: boolean
  lastNonZero: number
}

export function createVolumeState(
  volume = 80,
  muted = false,
  lastNonZero = Math.max(volume, 5),
): VolumeState {
  return { volume, muted, lastNonZero: lastNonZero || 5 }
}

export function stepVolume(state: VolumeState, delta: number): VolumeState {
  if (state.muted && delta > 0) {
    const volume = Math.min(100, state.lastNonZero + delta)
    return { volume, muted: false, lastNonZero: Math.max(volume, 5) }
  }
  const volume = Math.min(100, Math.max(0, state.volume + delta))
  return {
    volume,
    muted: volume === 0,
    lastNonZero: volume > 0 ? volume : state.lastNonZero,
  }
}

export function toggleMute(state: VolumeState): VolumeState {
  if (state.muted) {
    const volume = Math.max(state.lastNonZero, 5)
    return { volume, muted: false, lastNonZero: volume }
  }
  return { ...state, muted: true, lastNonZero: Math.max(state.volume, 5) }
}
