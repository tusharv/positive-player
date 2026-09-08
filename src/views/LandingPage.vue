<script setup lang="ts">
import { CHANNELS, CHANNEL_COUNT, formatChannelNumber } from '../data/channels'

const featuredNames = ['DD Classics', 'Bollywood', 'Cricket', 'Nature']
const featured = featuredNames.flatMap((name) => {
  const channel = CHANNELS.find((item) => item.name === name)
  return channel ? [channel] : []
})
</script>

<template>
  <div class="landing">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="header">
      <RouterLink to="/" class="brand" aria-label="1988.in home">
        <img src="/brand/1988-logo.svg" alt="1988.in" width="144" height="48" />
      </RouterLink>
      <nav aria-label="Main navigation">
        <a href="#story">The story</a>
        <a href="#channels">What's on</a>
        <RouterLink to="/watch" class="nav-watch"
          >Watch TV <span aria-hidden="true">↗</span></RouterLink
        >
      </nav>
    </header>

    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">A little bit of then. Right here.</p>
          <h1 id="hero-title">Ghar aao.<br />TV lagao.</h1>
          <p class="intro">
            The familiar glow. The favourite shows. A little corner of the internet that feels like
            home.
          </p>
          <RouterLink to="/watch" class="watch-button"
            ><span class="play" aria-hidden="true">▶</span> Watch TV</RouterLink
          >
        </div>
        <div class="hero-picture">
          <img
            src="/brand/1988-living-room.webp"
            alt="A wooden television with a lace cover and colour bars in an imagined 1980s Indian living room"
            width="1536"
            height="1024"
            fetchpriority="high"
          />
        </div>
      </section>

      <section id="story" class="story" aria-labelledby="story-title">
        <p class="hindi" lang="hi">वही टीवी वाली बात।</p>
        <h2 id="story-title">
          Remember when watching TV<br class="desktop-break" />
          was a plan in itself?
        </h2>
        <div class="story-copy">
          <p>
            Someone adjusted the antenna. Someone called everyone into the room. And for a while, we
            all watched the same thing.
          </p>
          <p>
            1988.in brings back a little of that feeling. A television in your browser, with old
            favourites and good things to discover. Turn it on. See what's playing.
          </p>
        </div>
        <div class="colour-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      </section>

      <section id="channels" class="channels" aria-labelledby="channels-title">
        <div class="channel-heading">
          <h2 id="channels-title">Kya chal raha hai?</h2>
          <p>A few familiar favourites from our {{ CHANNEL_COUNT }} channels.</p>
        </div>
        <div class="channel-list">
          <article v-for="channel in featured" :key="channel.number" class="channel-row">
            <span class="channel-number">CH {{ formatChannelNumber(channel.number) }}</span>
            <h3>{{ channel.name }}</h3>
            <p>
              {{
                channel.name === 'DD Classics'
                  ? 'A little of the television we grew up with.'
                  : channel.blurb
              }}
            </p>
            <span class="channel-category">{{ channel.category }}</span>
          </article>
        </div>
        <p class="channel-note">
          Classic programmes sit alongside music, nature, sport, and more. Explore the full guide
          inside the TV.
        </p>
      </section>

      <section class="how" aria-labelledby="how-title">
        <div class="how-title">
          <h2 id="how-title">
            Same ritual.<br />
            New remote.
          </h2>
          <p>Settle in. We'll bring the television.</p>
        </div>
        <ol>
          <li>
            <h3>Switch it on.</h3>
            <p>Open the TV, accept the station notice, and press the power button.</p>
          </li>
          <li>
            <h3>Find your channel.</h3>
            <p>Use the arrow keys or open the channel guide. Something is already playing.</p>
          </li>
          <li>
            <h3>Pass the remote.</h3>
            <p>Choose “Connect remote” on the TV and scan the QR code with your phone.</p>
          </li>
        </ol>
      </section>

      <section class="closing" aria-labelledby="closing-title">
        <p lang="hi">चलो, टीवी देखते हैं।</p>
        <h2 id="closing-title">Your seat is still there.</h2>
        <RouterLink to="/watch" class="watch-button"
          ><span class="play" aria-hidden="true">▶</span> Watch TV</RouterLink
        >
      </section>
    </main>

    <footer class="footer">
      <div>
        <img src="/brand/1988-logo.svg" alt="1988.in" width="120" height="40" />
        <p>Inspired by the India we watched TV in.</p>
      </div>
      <nav aria-label="Footer navigation">
        <RouterLink to="/privacy">Privacy</RouterLink><RouterLink to="/terms">Terms</RouterLink
        ><RouterLink to="/remote">Phone remote</RouterLink>
      </nav>
      <p class="footnote">
        An independent nostalgia project. Not affiliated with Doordarshan or Prasar Bharati. Videos
        play through YouTube. 1988 is our inspiration; programmes span different years.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  --blue: #183b9b;
  --paper: #f5f4ed;
  --ink: #182645;
  --muted: #586078;
  background: var(--paper);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}
.landing * {
  box-sizing: border-box;
}
.landing a {
  color: inherit;
}
.landing a:focus-visible {
  outline: 3px solid #ce7976;
  outline-offset: 6px;
}
.landing section {
  scroll-margin-top: 24px;
}
.header {
  height: 80px;
  max-width: 1440px;
  margin: auto;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
}
.header nav {
  display: flex;
  align-items: center;
  gap: 34px;
  font-size: 14px;
  font-weight: 600;
}
.header nav a {
  text-decoration: none;
}
.header nav a:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
}
.header .nav-watch {
  color: var(--blue);
  border-bottom: 1px solid var(--blue);
  padding: 10px 0;
}
.nav-watch span {
  margin-left: 12px;
}
.hero {
  background: var(--blue);
  color: #fffdf5;
  display: grid;
  grid-template-columns: 0.88fr 1.12fr;
  align-items: center;
  padding: 48px 5% 56px;
  gap: 40px;
}
.hero-copy {
  max-width: 550px;
  justify-self: end;
  width: 100%;
}
.eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  margin: 0 0 28px;
  letter-spacing: 0.065em;
  text-transform: uppercase;
}
h1 {
  font-size: clamp(48px, 5.5vw, 84px);
  letter-spacing: -0.065em;
  line-height: 1.02;
  margin: 0;
  font-weight: 800;
}
.intro {
  max-width: 335px;
  font-size: 17px;
  line-height: 1.65;
  margin: 25px 0 30px;
  color: #e2e8f8;
}
.watch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: #fffdf5;
  color: var(--blue) !important;
  min-height: 53px;
  padding: 0 26px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.18s,
    background 0.18s;
  white-space: nowrap;
}
.watch-button:hover {
  background: #e1e8fa;
  transform: translateY(-2px);
}
.play {
  font-size: 13px;
}
.hero-picture {
  width: 100%;
  max-width: 760px;
}
.hero-picture img {
  display: block;
  width: 100%;
  height: clamp(360px, 35vw, 510px);
  object-fit: cover;
  border-radius: 42% / 6%;
}
.story {
  text-align: center;
  padding: 88px 24px 0;
  max-width: 950px;
  margin: auto;
}
.hindi {
  font-family: 'Tiro Devanagari Hindi', serif;
  color: var(--blue);
  font-size: 25px;
  margin: 0 0 22px;
}
h2 {
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 1.16;
  margin: 0;
}
.story-copy {
  max-width: 610px;
  margin: 26px auto 0;
  font-size: 17px;
  color: var(--muted);
  line-height: 1.8;
}
.story-copy p {
  margin: 0 0 17px;
}
.colour-bars {
  display: flex;
  width: 126px;
  height: 9px;
  margin: 43px auto 0;
}
.colour-bars i {
  flex: 1;
  background: #d9b656;
}
.colour-bars i:nth-child(2) {
  background: #79b9b0;
}
.colour-bars i:nth-child(3) {
  background: #7a9d69;
}
.colour-bars i:nth-child(4) {
  background: #a58bae;
}
.colour-bars i:nth-child(5) {
  background: #ce7976;
}
.colour-bars i:nth-child(6) {
  background: var(--blue);
}
.channels {
  padding: 88px 5% 75px;
  max-width: 1440px;
  margin: auto;
}
.channel-heading p {
  margin: 16px 0 35px;
  color: var(--muted);
  font-size: 16px;
}
.channel-list {
  border-top: 2px solid var(--blue);
}
.channel-row {
  display: grid;
  grid-template-columns: 90px 1fr 1.5fr 100px;
  gap: 25px;
  padding: 25px 0;
  align-items: center;
  border-bottom: 1px solid #d4d7df;
}
.channel-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--blue);
}
.channel-row h3 {
  font-size: 23px;
  letter-spacing: -0.025em;
  margin: 0;
}
.channel-row p {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}
.channel-category {
  text-align: right;
  font-size: 12px;
  color: var(--muted);
}
.channel-note {
  max-width: 650px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 22px 0 0;
}
.how {
  background: #e6eafa;
  padding: 62px 8%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
}
.how-title p {
  font-size: 16px;
  color: var(--muted);
  margin-top: 22px;
}
.how ol {
  list-style: none;
  counter-reset: steps;
  padding: 0;
  margin: 0;
  max-width: 500px;
}
.how li {
  counter-increment: steps;
  position: relative;
  padding: 0 0 24px 48px;
}
.how li:last-child {
  padding-bottom: 0;
}
.how li::before {
  content: counter(steps);
  position: absolute;
  top: 1px;
  left: 0;
  border: 1px solid #aab5d2;
  border-radius: 50%;
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  color: var(--blue);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}
.how h3 {
  font-size: 19px;
  margin: 0 0 8px;
}
.how li p {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.65;
  margin: 0;
}
.closing {
  padding: 66px 24px 72px;
  background: var(--blue);
  color: #fffdf5;
  text-align: center;
}
.closing p {
  font-family: 'Tiro Devanagari Hindi', serif;
  font-size: 25px;
  margin: 0 0 15px;
}
.closing .watch-button {
  margin-top: 28px;
}
.footer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 25px;
  max-width: 1440px;
  margin: auto;
  padding: 36px 5% 24px;
}
.footer img {
  display: block;
}
.footer p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.7;
}
.footer nav {
  display: flex;
  gap: 25px;
  align-items: center;
  font-size: 12px;
}
.footer nav a {
  text-decoration: none;
}
.footer nav a:hover {
  text-decoration: underline;
}
.footer .footnote {
  grid-column: 1 / -1;
  font-size: 11px;
  border-top: 1px solid #d4d7df;
  padding-top: 20px;
  margin: 0;
}
.skip-link {
  position: absolute;
  left: 16px;
  top: -100px;
  padding: 14px;
  background: white;
  z-index: 5;
}
.skip-link:focus {
  top: 10px;
}
@media (min-width: 1600px) {
  .hero {
    padding-left: calc((100vw - 1296px) / 2);
    padding-right: calc((100vw - 1296px) / 2);
  }
}
@media (max-width: 767px) {
  .header {
    height: 76px;
    padding: 0 20px;
  }
  .header img {
    width: 112px;
    height: auto;
  }
  .header nav {
    gap: 20px;
    font-size: 12px;
  }
  .header nav a:first-child {
    display: none;
  }
  .hero {
    grid-template-columns: 1fr;
    padding: 38px 24px 32px;
    gap: 32px;
  }
  .hero-copy {
    justify-self: start;
  }
  .eyebrow {
    font-size: 9px;
    margin-bottom: 22px;
  }
  h1 {
    font-size: clamp(51px, 11vw, 76px);
  }
  .intro {
    font-size: 16px;
    max-width: 340px;
    margin: 22px 0 25px;
  }
  .hero-picture img {
    height: auto;
    aspect-ratio: 1.4;
  }
  .story {
    padding: 55px 24px 0;
  }
  .story h2 {
    font-size: 32px;
  }
  .desktop-break {
    display: none;
  }
  .story-copy {
    font-size: 16px;
  }
  .hindi {
    font-size: 22px;
  }
  .channels {
    padding: 55px 24px;
  }
  .channel-heading p {
    font-size: 14px;
    line-height: 1.6;
  }
  .channel-row {
    grid-template-columns: 65px 1fr;
    gap: 10px 16px;
    padding: 20px 0;
  }
  .channel-row h3 {
    font-size: 22px;
  }
  .channel-row p {
    grid-column: 2;
    font-size: 14px;
  }
  .channel-category {
    display: none;
  }
  .channel-number {
    font-size: 10px;
  }
  .how {
    grid-template-columns: 1fr;
    padding: 45px 24px;
    gap: 28px;
  }
  .how h2 br {
    display: none;
  }
  .how h2 {
    max-width: 300px;
  }
  .closing {
    padding: 50px 24px;
  }
  .closing h2 {
    font-size: 34px;
  }
  .footer {
    padding: 30px 24px 22px;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .footer nav {
    flex-wrap: wrap;
  }
  .footer .footnote {
    margin-top: 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .watch-button {
    transition: none;
  }
  .watch-button:hover {
    transform: none;
  }
}
</style>
