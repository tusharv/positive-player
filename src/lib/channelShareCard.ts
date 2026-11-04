// Keep the featured selection explicit: reordering the lineup must not give a
// channel somebody else's artwork. Everything else uses the shared station card.
export const FEATURED_SHARE_CARDS: Readonly<Record<string, string>> = {
  Bollywood: 'bollywood',
  Cricket: 'cricket',
  'Jungle Book': 'jungle-book',
  Shaktimaan: 'shaktimaan',
  'DD Classics': 'dd-classics',
  Ramayan: 'ramayan',
  Mahabharat: 'mahabharat',
  Animals: 'animals',
  'Street Food': 'street-food',
  Space: 'space',
  'Taarak Mehta Ka Ooltah Chashmah': 'taarak-mehta',
}

export function channelShareCard(channel?: { name: string }) {
  const slug =
    channel && Object.prototype.hasOwnProperty.call(FEATURED_SHARE_CARDS, channel.name)
      ? FEATURED_SHARE_CARDS[channel.name]
      : 'fallback'
  return {
    path: `share-cards/${slug}.png`,
    alt:
      slug === 'fallback'
        ? '1988.in — a retro television with broadcast colour bars. Come back to a simpler time.'
        : `${channel!.name} on 1988.in — a vintage wooden television in a warmly lit Indian living room, showing a channel-themed scene.`,
  }
}
