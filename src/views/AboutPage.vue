<script setup lang="ts">
import { ref } from 'vue'

const signal = ref(false)
</script>

<template>
  <div class="about-page">
    <a class="skip-link" href="#about-main">Skip to content</a>
    <div class="titlebar">
      <span>1988.in / behind the screen</span>
      <span aria-hidden="true">― &nbsp; □ &nbsp; ×</span>
    </div>
    <header class="header">
      <RouterLink to="/" aria-label="1988.in home">
        <img src="/brand/1988-logo.svg" alt="1988.in" width="144" height="48" />
      </RouterLink>
      <nav aria-label="Main navigation">
        <RouterLink to="/guide">Channel guide</RouterLink>
        <RouterLink class="button" to="/watch">Back to TV ↗</RouterLink>
      </nav>
    </header>

    <main id="about-main">
      <section class="intro" aria-labelledby="about-title">
        <div class="intro-copy">
          <p class="eyebrow">About · the people behind the picture</p>
          <h1 id="about-title">Somebody had<br />to hold the<br /><em>antenna.</em></h1>
          <p class="lead">
            A little nostalgia. A lot of channel surfing. And one very good excuse to sit a little
            closer to the television.
          </p>
          <a class="text-link" href="#contact">Say hello to the station ↓</a>
        </div>

        <div class="television">
          <div class="tv-screen" :class="{ 'has-signal': signal }">
            <div class="test-bars" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
            <div class="screen-message" aria-live="polite">
              <span class="screen-label">{{
                signal ? 'SIGNAL RECEIVED' : 'YOU ARE TUNED TO'
              }}</span>
              <strong>{{ signal ? 'Hello, you.' : '1988' }}</strong>
              <span>{{
                signal ? 'Looking good from this side.' : 'Please adjust your nostalgia.'
              }}</span>
            </div>
          </div>
          <div class="tv-controls">
            <span>COLOUR · GOOD COMPANY</span>
            <button type="button" :aria-pressed="signal" @click="signal = !signal">
              {{ signal ? 'Reset signal ↺' : 'Adjust antenna ↗' }}
            </button>
          </div>
          <p class="tv-caption">No climbing onto the roof required.</p>
        </div>
      </section>

      <section class="story" aria-labelledby="story-title">
        <p class="eyebrow">A small station with a familiar feeling</p>
        <h2 id="story-title">Remember when you watched<br />whatever was on?</h2>
        <div class="story-copy">
          <p>
            1988.in brings a little of that ritual to your browser: turn on the set, find a channel,
            and drop into a programme already in progress. No scrubbing ahead. No endless feed. Just
            you and the picture.
          </p>
          <p>
            The year is a feeling, not a cutoff. The programmes span different years; the
            inspiration is the television we grew up around.
          </p>
        </div>
      </section>

      <section class="credits" aria-labelledby="credits-title">
        <div class="section-label">
          <h2 id="credits-title">Roll the credits.</h2>
          <span>Made for the love of it.</span>
        </div>
        <div class="credit-grid">
          <article class="credit">
            <p class="eyebrow">Behind the controls</p>
            <h3>Tushar Vaghela</h3>
            <p>
              The person behind this little television on the internet. Yes, you can blame him for
              the nostalgia.
            </p>
            <a href="https://tusharv.in" target="_blank" rel="noopener noreferrer"
              >Visit tusharv.in ↗</a
            >
          </article>
          <article class="credit company">
            <img src="/brand/failure-company.png" alt="" width="64" height="64" />
            <p class="eyebrow">From the same workshop</p>
            <h3>A Failure Company project.</h3>
            <p>
              A name like that leaves plenty of room to try things. This television is one of them.
            </p>
            <a href="https://failure.company" target="_blank" rel="noopener noreferrer"
              >Visit failure.company ↗</a
            >
          </article>
        </div>
      </section>

      <section id="contact" class="contact" aria-labelledby="contact-title">
        <div>
          <p class="eyebrow">The lines are open</p>
          <h2 id="contact-title">Send a signal.</h2>
          <p>
            Found a wonky channel? Have a programme in mind? Just want to say “arre, I remember
            this”?
          </p>
          <p>Find Tushar through his website, or leave a note on GitHub about the project.</p>
          <div class="contact-actions">
            <a class="button" href="https://tusharv.in" target="_blank" rel="noopener noreferrer"
              >Find Tushar ↗</a
            >
            <a
              class="text-link"
              href="https://github.com/tusharv/positive-player/issues"
              target="_blank"
              rel="noopener noreferrer"
              >Report a bug or share an idea ↗</a
            >
          </div>
        </div>
        <div class="postcard">
          <span class="stamp" aria-hidden="true">
            <span class="stamp-print">
              <span class="stamp-country">INDIA · भारत</span>
              <svg class="stamp-art" viewBox="0 0 100 80" fill="none">
                <path d="M40 18 29 5m15 13L60 3" stroke="currentColor" stroke-width="2" />
                <rect x="12" y="20" width="76" height="49" rx="5" fill="#244c49" />
                <rect x="18" y="26" width="49" height="35" rx="7" fill="#f4deb0" />
                <path d="M24 32h7v23h-7z" fill="#c29048" />
                <path d="M31 32h8v23h-8z" fill="#7d9b8e" />
                <path d="M39 32h8v23h-8z" fill="#c16d52" />
                <path d="M47 32h8v23h-8z" fill="#7c839e" />
                <path d="M55 32h6v23h-6z" fill="#b4a16b" />
                <circle cx="77" cy="33" r="4" stroke="#f4deb0" />
                <circle cx="77" cy="46" r="4" stroke="#f4deb0" />
                <path
                  d="M73 57h8m-8 4h8M25 69l-3 6m53-6 3 6"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <span class="stamp-year">THE LITTLE SCREEN · 1988</span>
              <span class="stamp-value"
                ><span>FOR THE LOVE<br />OF STAMPS</span><b>₹ 1</b></span
              >
            </span>
          </span>
          <span class="postcard-title">Dear TV people,</span>
          <div class="postcard-message">
            Thank you for visiting this little corner of the internet. I’d love to hear what you
            think — your feedback, ideas, and favourite TV memories are always welcome.
          </div>
          <span class="postcard-signoff">Over &amp; out. ♡</span>
        </div>
      </section>
      <p class="signoff">
        <span lang="hi">मिलते हैं, ब्रेक के बाद।</span> See you after the break.
      </p>
    </main>

    <footer>
      <RouterLink to="/">← 1988.in</RouterLink>
      <span
        >By <a href="https://tusharv.in">Tushar Vaghela</a> · A
        <a href="https://failure.company">Failure Company</a> project</span
      >
      <nav aria-label="Footer navigation">
        <RouterLink to="/privacy">Privacy</RouterLink><RouterLink to="/terms">Terms</RouterLink>
      </nav>
      <p>
        An independent nostalgia project. Not affiliated with Doordarshan or Prasar Bharati. Videos
        play through YouTube.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  --blue: #183b9b;
  --ink: #182645;
  --paper: #efeee5;
  --muted: #586078;
  min-height: 100dvh;
  background: var(--paper);
  background-image: repeating-linear-gradient(0deg, transparent 0 7px, #183b9b06 7px 8px);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}
* {
  box-sizing: border-box;
}
a {
  color: var(--blue);
  text-underline-offset: 4px;
}
a:focus-visible,
button:focus-visible {
  outline: 3px solid #b34538;
  outline-offset: 5px;
}
.titlebar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 16px;
  color: #fffdf5;
  background: var(--blue);
  border: 2px outset #9daacf;
  font:
    11px/1.4 'IBM Plex Mono',
    monospace;
}
.header {
  max-width: 1280px;
  margin: auto;
  padding: 22px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.header img {
  display: block;
  max-width: 100%;
  height: auto;
}
nav {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 13px;
}
.button {
  display: inline-flex;
  justify-content: center;
  padding: 14px 20px;
  background: #e5e5e5;
  border: 3px outset #fff;
  box-shadow: 3px 3px 0 #0b225e;
  font:
    12px/1.4 'IBM Plex Mono',
    monospace;
  text-decoration: none;
}
.button:hover {
  background: #fffdf5;
}
.button:active {
  border-style: inset;
  box-shadow: none;
}
.intro {
  background: var(--blue);
  color: #fffdf5;
  padding: 70px max(5%, calc((100vw - 1152px) / 2));
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.eyebrow {
  font:
    11px/1.6 'IBM Plex Mono',
    monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 22px;
}
h1 {
  font-size: clamp(48px, 6.5vw, 86px);
  line-height: 1.02;
  letter-spacing: -0.06em;
  margin: 0;
}
h1 em {
  color: #f2cd68;
  font-family: Georgia, serif;
  font-weight: 400;
}
.lead {
  max-width: 370px;
  line-height: 1.75;
  margin: 28px 0;
  font-size: 17px;
  color: #e2e8f8;
}
.intro .text-link {
  color: #fffdf5;
  font-size: 14px;
}
.television {
  background: #b9a080;
  padding: 22px 22px 0;
  border: 5px ridge #e2c8a2;
  box-shadow: 10px 12px 0 #102761;
  transform: rotate(-2deg);
}
.tv-screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  border: 9px solid #282725;
  border-radius: 42% / 7%;
  background: #172526;
}
.test-bars {
  display: flex;
  position: absolute;
  inset: 0;
  opacity: 0.8;
}
.test-bars i {
  flex: 1;
  background: #eee7c8;
}
.test-bars i:nth-child(2) {
  background: #e7c34f;
}
.test-bars i:nth-child(3) {
  background: #60b7b9;
}
.test-bars i:nth-child(4) {
  background: #7b9f64;
}
.test-bars i:nth-child(5) {
  background: #b28ab1;
}
.test-bars i:nth-child(6) {
  background: #c65a51;
}
.test-bars i:nth-child(7) {
  background: #354f9c;
}
.screen-message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 16px;
  color: #fffdf5;
  background: repeating-linear-gradient(0deg, #0002 0 1px, transparent 1px 4px);
  font:
    11px/1.5 'IBM Plex Mono',
    monospace;
}
.screen-message strong {
  background: #182645;
  padding: 0 15px;
  font-size: clamp(32px, 5vw, 64px);
  letter-spacing: -0.05em;
}
.screen-message > span {
  background: #182645;
  padding: 3px 8px;
}
.has-signal .test-bars {
  opacity: 0.25;
}
.tv-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px 0;
  color: #24221e;
  font:
    9px/1.5 'IBM Plex Mono',
    monospace;
}
.tv-controls button {
  cursor: pointer;
  color: #182645;
  background: #e5dfd2;
  border: 3px outset #f1e8d5;
  padding: 10px;
  font-size: 11px;
}
.tv-controls button:active {
  border-style: inset;
}
.tv-caption {
  margin: 0 -22px;
  padding: 12px;
  background: #102761;
  color: #e2e8f8;
  text-align: center;
  font:
    10px/1.5 'IBM Plex Mono',
    monospace;
}
.story,
.credits,
.contact {
  max-width: 1152px;
  margin: auto;
  padding: 72px 0;
}
.story {
  text-align: center;
}
.story .eyebrow {
  color: var(--blue);
}
h2 {
  margin: 0;
  font-size: clamp(32px, 3.7vw, 48px);
  line-height: 1.12;
  letter-spacing: -0.045em;
}
.story-copy {
  max-width: 650px;
  margin: 25px auto 0;
}
.story-copy p,
.credit > p:not(.eyebrow),
.contact p:not(.eyebrow) {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}
.credits {
  border-top: 3px double #a6adc0;
}
.section-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}
.section-label > span {
  font:
    11px/1.5 'IBM Plex Mono',
    monospace;
  color: var(--muted);
}
.credit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 3px ridge #b9bfd0;
  background: #ffffff55;
}
.credit {
  padding: 36px;
}
.credit + .credit {
  border-left: 1px solid #b9bfd0;
}
.credit .eyebrow {
  color: var(--blue);
  margin-bottom: 14px;
}
h3 {
  margin: 0;
  font-size: 29px;
  letter-spacing: -0.04em;
}
.credit a {
  display: inline-block;
  margin-top: 12px;
  font-size: 14px;
}
.company img {
  float: right;
  margin: 0 0 16px 16px;
}
.contact {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 70px;
  align-items: center;
  border-top: 3px double #a6adc0;
  scroll-margin-top: 24px;
}
.contact .eyebrow {
  color: var(--blue);
}
.contact-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 28px;
}
.contact-actions .text-link {
  font-size: 13px;
}
.postcard {
  min-height: 255px;
  border: 1px solid #bac0c9;
  box-shadow: 5px 6px 0 #d1d4dd;
  background: #fffce3;
  padding: 30px;
  transform: rotate(3deg);
}
.stamp {
  float: right;
  width: 112px;
  margin: -10px -10px 12px 14px;
  padding: 9px;
  background: #faf2d8;
  color: #244c49;
  text-align: center;
  filter: drop-shadow(1px 2px 1px #18264530);
  transform: rotate(9deg);
  mask:
    linear-gradient(#000 0 0) center / calc(100% - 8px) calc(100% - 8px) no-repeat,
    radial-gradient(circle, transparent 2px, #000 2.5px) -4px -4px / 8px 8px;
}
.stamp-print {
  display: block;
  border: 1px solid #658278;
  padding: 7px 5px 5px;
  background: repeating-linear-gradient(0deg, #244c4909 0 1px, transparent 1px 3px), #e4e8d2;
}
.stamp-country {
  display: block;
  font:
    bold 10px/1.4 Georgia,
    serif;
  letter-spacing: 1px;
}
.stamp-art {
  display: block;
  width: 100%;
  margin: 5px 0 3px;
}
.stamp-year {
  display: block;
  font:
    5px/1.5 'IBM Plex Mono',
    monospace;
  letter-spacing: 0.3px;
}
.stamp-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  padding-top: 4px;
  border-top: 1px solid #658278;
  text-align: left;
  font:
    5px/1.5 'IBM Plex Mono',
    monospace;
}
.stamp-value b {
  font:
    bold 19px/1 Georgia,
    serif;
}
.postcard-title {
  display: block;
  padding-top: 78px;
  font:
    italic 25px/1.4 Georgia,
    serif;
}
.postcard-message {
  clear: both;
  margin-top: 16px;
  color: var(--ink);
  font:
    italic 17px/1.9 Georgia,
    serif;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 calc(1.9em - 1px),
    #a6adc080 calc(1.9em - 1px) 1.9em
  );
}
.postcard-signoff {
  display: block;
  margin-top: 25px;
  font:
    italic 20px Georgia,
    serif;
  text-align: right;
}
.signoff {
  text-align: center;
  margin: 0;
  padding: 28px 20px 50px;
  font-size: 12px;
  color: var(--muted);
}
.signoff span {
  display: block;
  margin-bottom: 12px;
  font:
    27px 'Tiro Devanagari Hindi',
    serif;
  color: var(--blue);
}
footer {
  max-width: 1152px;
  margin: auto;
  border-top: 3px double #a6adc0;
  padding: 28px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  font-size: 12px;
  line-height: 1.7;
}
footer p {
  width: 100%;
  margin: 0;
  color: var(--muted);
  font-size: 11px;
}
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  padding: 14px;
  background: #fff;
  z-index: 5;
}
.skip-link:focus {
  top: 10px;
}
@media (max-width: 1280px) {
  .story,
  .credits,
  .contact,
  footer {
    margin-left: 5%;
    margin-right: 5%;
  }
}
@media (max-width: 700px) {
  .header {
    padding: 18px 5%;
  }
  .header img {
    width: 108px;
  }
  .header nav {
    gap: 14px;
  }
  .header nav > a:first-child {
    display: none;
  }
  .titlebar {
    font-size: 9px;
  }
  .intro {
    grid-template-columns: 1fr;
    padding: 40px 6% 48px;
    gap: 40px;
  }
  h1 {
    font-size: clamp(48px, 11vw, 72px);
  }
  .eyebrow {
    font-size: 10px;
  }
  .television {
    max-width: 440px;
    width: 96%;
    justify-self: center;
  }
  .screen-message strong {
    font-size: 48px;
  }
  .story,
  .credits,
  .contact {
    padding: 48px 0;
  }
  .section-label {
    align-items: start;
    flex-direction: column;
    gap: 14px;
  }
  .credit-grid,
  .contact {
    grid-template-columns: 1fr;
  }
  .credit {
    padding: 26px;
  }
  .credit + .credit {
    border-left: 0;
    border-top: 1px solid #b9bfd0;
  }
  .contact {
    gap: 36px;
  }
  .postcard {
    margin: 0 10px;
  }
  footer {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
