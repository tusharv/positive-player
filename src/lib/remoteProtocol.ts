import { CHANNEL_COUNT } from '../data/channels.ts'

export type RemoteCommand =
  | { action: 'channelStep'; value: -1 | 1 }
  | { action: 'volumeStep'; value: -5 | 5 }
  | { action: 'digit'; value: string }
  | { action: 'mute' }
  | { action: 'powerOff' }
  | { action: 'powerToggle' }

export type TvSnapshot = {
  poweredOn: boolean
  channelNumber: number
  volume: number
  muted: boolean
  interruption: 'none' | 'brief' | 'hold'
}

export function isCommand(value: unknown): value is RemoteCommand {
  if (!value || typeof value !== 'object') return false
  const command = value as Record<string, unknown>
  switch (command.action) {
    case 'channelStep':
      return command.value === -1 || command.value === 1
    case 'volumeStep':
      return command.value === -5 || command.value === 5
    case 'digit':
      return typeof command.value === 'string' && /^[0-9]$/.test(command.value)
    case 'powerToggle':
    case 'powerOff':
    case 'mute':
      return true
    default:
      return false
  }
}

export function isSnapshot(value: unknown): value is TvSnapshot {
  if (!value || typeof value !== 'object') return false
  const state = value as TvSnapshot
  return (
    typeof state.poweredOn === 'boolean' &&
    typeof state.muted === 'boolean' &&
    Number.isInteger(state.channelNumber) &&
    state.channelNumber >= 1 &&
    state.channelNumber <= CHANNEL_COUNT &&
    Number.isInteger(state.volume) &&
    state.volume >= 0 &&
    state.volume <= 100 &&
    ['none', 'brief', 'hold'].includes(state.interruption)
  )
}
