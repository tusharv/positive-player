export const CHANNEL_ZAP_MS = 420

export function channelZapNeeded(from: number, to: number, poweredOn: boolean): boolean {
  return poweredOn && from !== to
}
