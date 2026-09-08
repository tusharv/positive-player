/** SMPTE ECR 1-1978 75% bars, studio R'G'B' shown as CSS rgb. */

export const SMPTE_COLOR = {
  white75: 'rgb(180, 180, 180)',
  yellow75: 'rgb(180, 180, 16)',
  cyan75: 'rgb(16, 180, 180)',
  green75: 'rgb(16, 180, 16)',
  magenta75: 'rgb(180, 16, 180)',
  red75: 'rgb(180, 16, 16)',
  blue75: 'rgb(16, 16, 180)',
  black: 'rgb(16, 16, 16)',
  white100: 'rgb(235, 235, 235)',
  minusI: 'rgb(16, 70, 106)',
  plusQ: 'rgb(72, 16, 118)',
  plugeLow: 'rgb(9, 9, 9)',
  plugeBlack: 'rgb(16, 16, 16)',
  plugeHigh: 'rgb(29, 29, 29)',
} as const

export const SMPTE_TOP = ['white', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue'] as const

export const SMPTE_MID = ['blue', 'black', 'magenta', 'black', 'cyan', 'black', 'white'] as const

export const SMPTE_TOP_COLORS = [
  SMPTE_COLOR.white75,
  SMPTE_COLOR.yellow75,
  SMPTE_COLOR.cyan75,
  SMPTE_COLOR.green75,
  SMPTE_COLOR.magenta75,
  SMPTE_COLOR.red75,
  SMPTE_COLOR.blue75,
] as const

export const SMPTE_MID_COLORS = [
  SMPTE_COLOR.blue75,
  SMPTE_COLOR.black,
  SMPTE_COLOR.magenta75,
  SMPTE_COLOR.black,
  SMPTE_COLOR.cyan75,
  SMPTE_COLOR.black,
  SMPTE_COLOR.white75,
] as const
