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
    <div class="web-titlebar" aria-hidden="true">
      <span>1988.in — Feel 1988. No skip.</span>
      <span class="window-marks">― &nbsp; □ &nbsp; ×</span>
    </div>
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
    <aside class="web-notice" aria-label="What's new">
      <strong>NEW!</strong>
      <span>The remote is now on your phone.</span>
      <a href="#how">Here's how it works »</a>
    </aside>

    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">Instead of reels</p>
          <h1 id="hero-title">Feel 1988.<br />No skip.</h1>
          <p class="intro">
            A CRT in the browser. The programme is already on, and the glass has no skip button.
            Change the channel, or stay with it.
          </p>
          <RouterLink to="/watch" class="watch-button"
            ><span class="play" aria-hidden="true">▶</span> Watch TV</RouterLink
          >
        </div>
        <div class="hero-picture">
          <div class="picture-caption">
            <span>The family television</span><span aria-hidden="true">[ 1988 ]</span>
          </div>
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
        <p class="hindi" lang="hi">रील नहीं। टेलीविजन।</p>
        <h2 id="story-title">
          A CRT from 1988,<br class="desktop-break" />
          with nothing to skip.
        </h2>
        <div class="story-copy">
          <p>
            You arrive in the middle of a broadcast. Scanlines stay on the glass. There is no
            progress bar and no next clip waiting under your thumb.
          </p>
          <p>
            1988.in is that set. Bollywood, cricket, the old serials, then quieter channels after
            them. Tune to another number if you want a different picture. The one you are on keeps
            playing.
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

      <section id="how" class="how" aria-labelledby="how-title">
        <div class="how-title">
          <h2 id="how-title">
            Same ritual.<br />
            New remote.
          </h2>
          <p>The picture stays on your computer. Your phone becomes the remote.</p>
        </div>
        <ol>
          <li>
            <h3>Open the watch page.</h3>
            <p>On your computer, click “Connect remote”. A QR code and a short code appear.</p>
          </li>
          <li>
            <h3>Scan it, or type it.</h3>
            <p>
              Scan the code with your phone. Or open
              <RouterLink to="/remote">/remote</RouterLink> and enter the code shown on the TV.
            </p>
          </li>
          <li>
            <h3>Your phone takes the controls.</h3>
            <p>
              The <RouterLink to="/remote">/remote</RouterLink> page on your phone connects to the
              TV on your desktop.
            </p>
          </li>
        </ol>
      </section>

      <section id="support" class="support" aria-labelledby="support-title">
        <div class="support-copy">
          <h2 id="support-title">Support this project.</h2>
          <p>Upvote it on Product Hunt, Peerlist, or PeerPush, or star the source on GitHub.</p>
        </div>
        <div class="support-actions">
          <a
            class="producthunt"
            href="https://www.producthunt.com/products/1988-in-feel-1988-no-skip?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-1988-in-feel-1988-no-skip"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="1988.in — Feel 1988. No skip. - Experience the 1988 era of Doordarshan. | Product Hunt"
              width="250"
              height="54"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1272302&theme=light&t=1791354371718"
            />
          </a>
          <a
            class="peerlist"
            href="https://peerlist.io/tusharv/project/feel-1988-no-skip"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://peerlist.io/api/v1/projects/embed/PRJH6A7QME7NEPMLR3G8PK6NNPQGL8?showUpvote=true&theme=dark"
              alt="Feel 1988. No skip."
            />
          </a>
          <a
            class="peerpush"
            href="https://peerpush.com/p/1988in"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="https://peerpush.com/p/1988in/badge.png" alt="1988.in on PeerPush" />
          </a>
          <a
            class="github-link"
            href="https://github.com/tusharv/positive-player"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="github-mark" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            <span class="github-copy">
              <span class="github-title">Star on GitHub</span>
              <span class="github-repo">tusharv/positive-player</span>
            </span>
          </a>
        </div>
        <div class="failure">
          <a
            class="failure-mark"
            href="https://www.failure.company/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/brand/failure-company.png" alt="Failure Company" width="64" height="64" />
          </a>
          <div class="failure-copy">
            <p class="failure-kicker">A Failure Company project</p>
            <p>
              <a href="https://www.failure.company/" target="_blank" rel="noopener noreferrer"
                >Failure Company</a
              >
              is a community of developers making useful things with what they have. The ambition is
              useful work and a sustainable living — community first.
            </p>
          </div>
        </div>
      </section>

      <section class="closing" aria-labelledby="closing-title">
        <p lang="hi">देखते रहो।</p>
        <h2 id="closing-title">Stay with the picture.</h2>
        <RouterLink to="/watch" class="watch-button"
          ><span class="play" aria-hidden="true">▶</span> Watch TV</RouterLink
        >
      </section>
    </main>

    <footer class="footer">
      <div>
        <img src="/brand/1988-logo.svg" alt="1988.in" width="120" height="40" />
        <p>A CRT you stay with. 1988 is the year on the glass.</p>
      </div>
      <nav aria-label="Footer navigation">
        <RouterLink to="/privacy">Privacy</RouterLink><RouterLink to="/terms">Terms</RouterLink
        ><RouterLink to="/remote">Phone remote</RouterLink>
      </nav>
      <div class="web-footer">
        <div class="channel-counter" :aria-label="`${CHANNEL_COUNT} channels to explore`">
          <span class="counter-label">CHANNELS TO EXPLORE</span>
          <span class="counter-digits">{{ String(CHANNEL_COUNT).padStart(4, '0') }}</span>
        </div>
        <div class="web-buttons" aria-label="About this website">
          <span class="web-badge"
            ><b>1988</b><span>INDIA<br />ON SCREEN</span></span
          >
          <span class="web-badge"
            ><b>WWW</b><span>MADE FOR<br />THE WEB</span></span
          >
        </div>
        <a href="#main">Back to top ↑</a>
      </div>
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
.producthunt,
.peerlist,
.peerpush {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  line-height: 0;
  text-decoration: none;
}
.producthunt img,
.peerlist img,
.peerpush img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 296 / 72;
  object-fit: fill;
}
.peerpush img {
  aspect-ratio: 460 / 130;
  object-fit: contain;
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
.how li a {
  color: var(--blue);
  text-underline-offset: 3px;
}
.how li a:hover {
  color: var(--ink);
}
.support {
  max-width: 1440px;
  margin: auto;
  padding: 72px 8%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 70px;
  align-items: center;
}
.support-copy p {
  max-width: 420px;
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
}
.support-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 296px;
  max-width: 100%;
}
.support .github-link {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: auto;
  aspect-ratio: 296 / 72;
  padding: 0 18px;
  background: #182645;
  color: #fffdf5;
  border: 0;
  border-radius: 18px;
  box-shadow: none;
  font-family: 'IBM Plex Mono', monospace;
  text-decoration: none;
}
.github-mark {
  width: 34px;
  height: 34px;
  flex: none;
}
.github-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  line-height: 1.1;
}
.github-title {
  font-size: 15px;
  font-weight: 700;
}
.support .github-repo {
  font-size: 11px;
  color: #c9d3ea;
}
.support .github-link:hover {
  background: var(--blue);
  color: #fffdf5;
}
.support .github-link:active {
  background: #10192e;
}
.failure {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding-top: 28px;
  border-top: 3px double #a6adc0;
}
.failure-mark {
  flex: none;
  line-height: 0;
  text-decoration: none;
}
.failure-mark img {
  display: block;
  width: 64px;
  height: 64px;
}
.failure-copy .failure-kicker {
  margin: 2px 0 8px;
  color: var(--blue);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.failure-copy p {
  max-width: 640px;
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
}
.support .failure-copy a {
  color: var(--blue);
  font-weight: 700;
  text-underline-offset: 3px;
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
  .support {
    grid-template-columns: 1fr;
    padding: 48px 24px;
    gap: 24px;
  }
  .failure {
    gap: 14px;
    padding-top: 22px;
  }
  .failure-mark img {
    width: 56px;
    height: 56px;
  }
  .failure-copy p {
    font-size: 15px;
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

<style scoped>
/* Early personal-web details: tiled paper, browser chrome and raised controls. */
.landing {
  background-color: #efeee5;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 7px, #183b9b06 7px 8px),
    repeating-linear-gradient(90deg, transparent 0 7px, #183b9b06 7px 8px);
}
.web-titlebar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 16px;
  background: #183b9b;
  color: #fffdf5;
  border: 2px outset #9daacf;
  font:
    11px/1.4 'IBM Plex Mono',
    monospace;
}
.window-marks {
  white-space: nowrap;
}
.header nav a,
.footer nav a {
  color: #183b9b;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.web-notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  padding: 11px 20px;
  border-top: 1px solid #a6adc0;
  border-bottom: 3px double #a6adc0;
  background: #fffce3;
  color: #28304c;
  font:
    12px/1.5 'IBM Plex Mono',
    monospace;
}
.web-notice strong {
  color: #9b2424;
  font-style: italic;
}
.web-notice a {
  color: #183b9b;
  text-underline-offset: 3px;
}
.hero {
  background-image: radial-gradient(#ffffff12 0.7px, transparent 0.7px);
  background-size: 6px 6px;
}
.hero-picture {
  padding: 5px;
  background: #c5c5c5;
  border: 3px outset #e8e8e8;
  box-shadow: 7px 7px 0 #0a205d;
}
.picture-caption {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 9px;
  background: #112c78;
  color: #fffdf5;
  font:
    11px/1.4 'IBM Plex Mono',
    monospace;
}
.hero-picture img {
  border-radius: 0;
  border: 2px inset #e8e8e8;
}
.watch-button {
  border: 3px outset #ffffff;
  border-radius: 0;
  background: #e5e5e5;
  box-shadow: 3px 3px 0 #0b225e;
  font-family: 'IBM Plex Mono', monospace;
  transition: background 0.15s;
}
.watch-button:hover {
  transform: none;
  background: #fffdf5;
}
.watch-button:active {
  border-style: inset;
  box-shadow: none;
}
.channel-list {
  border: 3px ridge #b9bfd0;
  padding: 0 18px;
  background: #ffffff55;
}
.channel-row:last-child {
  border-bottom: 0;
}
.web-footer {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 0 4px;
  border-top: 3px double #a6adc0;
  font:
    11px/1.5 'IBM Plex Mono',
    monospace;
}
.channel-counter {
  display: flex;
  align-items: center;
  gap: 12px;
}
.counter-label {
  max-width: 85px;
  font-size: 9px;
}
.counter-digits {
  background: #15213b;
  color: #fffdf5;
  border: 3px inset #bcc3d0;
  padding: 3px 5px 3px 9px;
  font:
    22px/1 'IBM Plex Mono',
    monospace;
  letter-spacing: 5px;
}
.web-buttons {
  display: flex;
  gap: 10px;
}
.web-badge {
  display: flex;
  width: 102px;
  height: 34px;
  border: 2px outset #fff;
  background: #dedede;
  color: #142347;
}
.web-badge b {
  display: grid;
  place-items: center;
  padding: 0 5px;
  background: #183b9b;
  color: white;
  font-size: 11px;
}
.web-badge > span {
  padding: 4px;
  font:
    bold 8px/1.25 Arial,
    sans-serif;
}
@media (max-width: 767px) {
  .web-titlebar {
    font-size: 9px;
    padding: 6px 10px;
  }
  .window-marks {
    display: none;
  }
  .web-notice {
    font-size: 10px;
    gap: 5px 8px;
    padding: 9px 16px;
  }
  .picture-caption {
    font-size: 9px;
  }
  .channel-list {
    padding: 0 12px;
  }
  .channel-row {
    gap: 10px;
    grid-template-columns: 55px 1fr;
  }
  .web-footer {
    gap: 20px;
  }
}
</style>
