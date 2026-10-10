// A video file can still contain only cover art. Bollywood's automated intake
// therefore requires an explicit publisher video label and rejects audio/lyric
// formats. Unlabelled mixes need editorial review instead of automatic inclusion.
export function isVideoSongTitle(title = '') {
  return (
    /\bvideos?\b|वीडियो/i.test(title) &&
    !/\baudio\b|\blyric(?:s|al)?\b|\bvisuali[sz]er\b|\bkaraoke\b|\binstrumental\b|\blo[ -]?fi\b|ऑडियो|लिरिक/i.test(
      title,
    )
  )
}

export function acceptsProgram(channelName, item) {
  return channelName !== 'Bollywood' || isVideoSongTitle(item.title)
}
