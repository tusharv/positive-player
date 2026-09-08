import { CHANNEL_COUNT, CHANNEL_DIGITS } from '../data/channels'

export { CHANNEL_COUNT, CHANNEL_DIGITS }

export const DIGIT_COMMIT_MS = 1200

export function wrapChannel(current: number, delta: number, max = CHANNEL_COUNT): number {
  return ((((current - 1 + delta) % max) + max) % max) + 1
}

export type DigitState = {
  digits: string
  lastAt: number
}

export type DigitResult = {
  state: DigitState
  channel: number | null
}

export function createDigitState(): DigitState {
  return { digits: '', lastAt: 0 }
}

function resolveChannel(digits: string): number | null {
  const n = Number.parseInt(digits, 10)
  if (!Number.isFinite(n) || n < 1 || n > CHANNEL_COUNT) return null
  return n
}

export function pushDigit(state: DigitState, digit: string, now: number): DigitResult {
  const stale = state.digits.length > 0 && now - state.lastAt > DIGIT_COMMIT_MS
  const base = stale ? '' : state.digits
  const digits = `${base}${digit}`.slice(-CHANNEL_DIGITS)

  if (digits.length === CHANNEL_DIGITS) {
    return { state: { digits: '', lastAt: now }, channel: resolveChannel(digits) }
  }

  return { state: { digits, lastAt: now }, channel: null }
}

export function flushDigits(state: DigitState, now: number): DigitResult {
  if (!state.digits) return { state, channel: null }
  if (now - state.lastAt < DIGIT_COMMIT_MS) return { state, channel: null }
  return { state: { digits: '', lastAt: now }, channel: resolveChannel(state.digits) }
}
