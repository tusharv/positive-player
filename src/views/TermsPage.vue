<script setup lang="ts">
import LegalDocument from '../components/LegalDocument.vue'
</script>

<template>
  <main>
    <LegalDocument title="Terms of Service" updated="8 September 2026">
      <p>
        These Terms of Service govern your use of Positive Player, an always-on CRT-style television
        that plays publicly available YouTube videos in the browser, including the optional phone
        remote.
      </p>
      <p>
        Positive Player uses YouTube API Services. By using Positive Player, you are agreeing to be
        bound by the
        <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
          >YouTube Terms of Service</a
        >. You also agree to this document and to our
        <RouterLink to="/privacy">Privacy Policy</RouterLink>. Google’s data practices for YouTube
        API Services are described in the
        <a href="http://www.google.com/policies/privacy" rel="noopener noreferrer" target="_blank"
          >Google Privacy Policy</a
        >.
      </p>

      <h2>The service</h2>
      <p>
        Positive Player provides a channel lineup and a player shell. Video files are hosted and
        streamed by YouTube, not by us. We use the YouTube Data API to look up public, embeddable
        videos for each channel and the YouTube IFrame Player API to play them. We do not offer
        uploading, commenting, liking, or account management on YouTube.
      </p>
      <p>
        YouTube may show its own branding, links, and advertisements in the player. Content
        availability, restrictions, and playback quality are controlled by YouTube.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be able to form a binding contract and to agree to the YouTube Terms of Service. Do
        not use Positive Player if YouTube does not permit you to use YouTube.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>
          Use the service only to watch content YouTube makes available for embedded playback.
        </li>
        <li>
          Do not misuse the pairing service, attempt to disrupt other viewers’ sessions, or
          circumvent rate limits.
        </li>
        <li>
          Do not use Positive Player to violate YouTube’s Terms of Service, Community Guidelines, or
          any law.
        </li>
        <li>
          Do not scrape, bulk-download, or redistribute YouTube content through this application.
        </li>
      </ul>

      <h2>No Google account access</h2>
      <p>
        Positive Player does not sign you into Google or YouTube and does not act on a YouTube
        account’s behalf. Any Google Account permissions you have granted to other apps are
        unrelated to this service.
      </p>

      <h2>Availability</h2>
      <p>
        The service is provided as-is. Channels may go to an interruption card when a YouTube API
        key is missing, quota is exhausted, a video cannot play, or the network fails. We may change
        the lineup or discontinue the service.
      </p>

      <h2>Disclaimers</h2>
      <p>
        Videos, titles, and ads are provided by YouTube and their uploaders. Positive Player does
        not endorse that content. To the fullest extent permitted by law, we disclaim warranties of
        merchantability, fitness for a particular purpose, and uninterrupted or error-free
        operation.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Positive Player and its developers are not liable
        for indirect, incidental, special, consequential, or exemplary damages, or for loss of data,
        goodwill, or playback time, arising from your use of the service or from YouTube API
        Services.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through
        <a
          href="https://github.com/tusharv/positive-player"
          rel="noopener noreferrer"
          target="_blank"
          >github.com/tusharv/positive-player</a
        >.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms by posting a new version here. Continued use after the effective
        date is acceptance of the updated terms. A new legal version may also require a fresh
        on-screen agreement before playback.
      </p>
    </LegalDocument>
  </main>
</template>
