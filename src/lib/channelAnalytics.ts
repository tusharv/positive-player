import type { Channel } from '../data/channels'

export type ChannelEvent = 'channel_select' | 'channel_play' | 'channel_error'
export type ChannelEventDetails = {
  video_id?: string
  failure_stage?: 'catalog' | 'player' | 'script'
  failure_reason?: string
  error_code?: string
}

export function trackChannel(
  event: ChannelEvent,
  channel: Channel,
  details: ChannelEventDetails = {},
) {
  if (typeof window === 'undefined') return
  const payload = {
    event,
    channel_number: channel.number,
    channel_name: channel.name,
    channel_category: channel.category ?? '',
    // Clear fields from previous events: GTM's data model retains absent keys.
    video_id: '',
    failure_stage: '',
    failure_reason: '',
    error_code: '',
    ...details,
  }
  try {
    window.dataLayer ??= []
    window.dataLayer.push(payload)
  } catch {
    /* Tracking must never interrupt television playback. */
  }
  try {
    // The standard Clarity queue supports a tag loaded later by GTM.
    // Bound it when tracking is blocked or Clarity is not installed.
    window.clarity ??= Object.assign(
      (...args: unknown[]) => {
        const queue = window.clarity!.q!
        if (queue.length < 200) queue.push(args)
      },
      { q: [] as unknown[][] },
    )
    window.clarity('set', 'channel_name', channel.name)
    window.clarity('set', 'channel_number', String(channel.number))
    if (details.failure_reason) window.clarity('set', 'channel_failure', details.failure_reason)
    window.clarity('event', event)
    window.clarity('event', `${event}_${String(channel.number).padStart(3, '0')}`)
  } catch {
    /* Provider errors must not affect the player. */
  }
}

export function playerFailureReason(code?: number): string {
  switch (code) {
    case 2:
      return 'invalid_video'
    case 5:
      return 'html5_playback'
    case 100:
      return 'video_unavailable'
    case 101:
    case 150:
      return 'embed_not_allowed'
    case 153:
      return 'player_configuration'
    default:
      return 'player_error'
  }
}
