<script setup lang="ts">
import LegalDocument from '../components/LegalDocument.vue'
</script>

<template>
  <main>
    <LegalDocument title="Privacy Policy" updated="8 September 2026">
      <p>
        Positive Player is an always-on CRT-style television that plays publicly available YouTube
        videos. This Privacy Policy explains what information we access, collect, store, use, and
        share. <strong>Positive Player uses YouTube API Services</strong> (the YouTube Data API and
        the YouTube IFrame Player API) to find and play those videos.
      </p>
      <p>
        By using Positive Player you also agree to our
        <RouterLink to="/terms">Terms of Service</RouterLink>. Google’s handling of data through
        YouTube API Services is described in the
        <a href="http://www.google.com/policies/privacy" rel="noopener noreferrer" target="_blank"
          >Google Privacy Policy</a
        >. YouTube’s rules for viewers are in the
        <a href="https://www.youtube.com/t/terms" rel="noopener noreferrer" target="_blank"
          >YouTube Terms of Service</a
        >.
      </p>

      <h2>Information we collect</h2>
      <p>
        Positive Player does not request access to your Google or YouTube account. We do not use
        OAuth, we do not receive Authorized Data from Google, and we do not see your Google
        password, channel, subscriptions, or watch history.
      </p>
      <p>On your device, the app may store:</p>
      <ul>
        <li>Your agreement to this policy and the Terms of Service.</li>
        <li>The last channel and volume settings, so a refresh returns to the same broadcast.</li>
        <li>
          A short-lived cache of public video IDs and durations for the current channel lineup, used
          only to pick what is “on air” without repeating YouTube Data API requests.
        </li>
        <li>
          If you pair a phone remote in this browser tab: a temporary session identifier and token
          in session storage so a refresh can reconnect.
        </li>
      </ul>
      <p>
        If you use the phone remote, our pairing server keeps an in-memory session for that TV
        (pairing code, session tokens, and whether each device is connected). It may see the
        connecting IP address to apply rate limits. Those sessions are not written to a database.
        Invitations expire in minutes, idle sessions expire in hours, and restarting the server
        clears them. The server never receives video files; playback goes from YouTube to your
        browser.
      </p>
      <p>
        We do not collect your name, email address, payment details, or precise location. We do not
        ask you to create an account with us.
      </p>

      <h2>YouTube API Services and API data</h2>
      <p>
        When you turn the set on, the browser calls YouTube API Services with our API key to search
        or list public, embeddable videos for the built-in channel lineup, and to read public
        duration and embeddability metadata. The IFrame Player then loads the chosen video from
        YouTube. That API Data is public video metadata (identifiers and durations), not information
        about your Google account.
      </p>
      <p>
        YouTube and Google may collect information about your use of the embedded player and Data
        API, including device and browser data, IP address, playback events, and identifiers stored
        on your device. That collection is governed by the
        <a href="http://www.google.com/policies/privacy" rel="noopener noreferrer" target="_blank"
          >Google Privacy Policy</a
        >.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To play the current broadcast and remember your channel and sound preferences.</li>
        <li>To pair a phone as a remote and send channel, volume, and mute commands.</li>
        <li>To limit abuse of the pairing service.</li>
        <li>To honor your recorded agreement to this policy.</li>
      </ul>
      <p>
        We do not use this information for advertising of our own, for selling data, or for
        profiling you across other sites.
      </p>

      <h2>How we share information</h2>
      <p>
        We share requests needed to operate the service with YouTube and Google as providers of
        YouTube API Services (search/list metadata and video playback). If you use a phone remote,
        pairing traffic goes through our relay so the phone can control the TV. We do not sell
        personal information. We do not share your data with other advertisers or data brokers.
      </p>
      <p>
        Positive Player allows a third party — YouTube / Google — to serve content, including
        advertisements, through the embedded player.
      </p>

      <h2>Cookies and similar technologies</h2>
      <p>
        Positive Player itself uses browser storage — local storage and session storage — as
        described above. It does not set first-party advertising cookies.
      </p>
      <p>
        YouTube and Google may store, access, or collect information directly or indirectly on or
        from your device, including by placing, accessing, or recognizing cookies or similar
        technology on your device or browser, when the IFrame Player or YouTube API Services load.
        See the
        <a href="http://www.google.com/policies/privacy" rel="noopener noreferrer" target="_blank"
          >Google Privacy Policy</a
        >
        for those practices.
      </p>

      <h2>Advertisements</h2>
      <p>
        Videos play in YouTube’s player. YouTube may show advertisements. Those ads are served by
        Google/YouTube, not by Positive Player. We do not control their content or targeting.
      </p>

      <h2>Retention, deletion, and Google permissions</h2>
      <p>
        Preference and cache data stay in this browser until you clear site data or they expire
        (catalog cache is kept for up to seven days). Remote pairing credentials last only for the
        browser tab and the in-memory server session.
      </p>
      <p>
        To delete data stored by Positive Player, clear this site’s cookies and site data in your
        browser, or use your browser’s site settings. That removes local preferences, catalog cache,
        consent, and tab-specific remote credentials.
      </p>
      <p>
        Because Positive Player does not request access to your Google or YouTube account, there is
        no Positive Player grant to revoke at Google. If you use other applications that do access
        your Google Account, you can review and revoke those apps at the
        <a
          href="https://security.google.com/settings/security/permissions"
          rel="noopener noreferrer"
          target="_blank"
          >Google security settings page</a
        >.
      </p>

      <h2>Children</h2>
      <p>
        Positive Player is not directed at children under 13. Channel searches use YouTube’s strict
        safe-search filter, but YouTube still determines which videos are returned and what ads
        appear. Do not use the service if you cannot agree to the YouTube Terms of Service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or complaints about these privacy practices can be sent through the project’s
        GitHub repository at
        <a
          href="https://github.com/tusharv/positive-player"
          rel="noopener noreferrer"
          target="_blank"
          >github.com/tusharv/positive-player</a
        >.
      </p>

      <h2>Changes</h2>
      <p>
        If we change how we collect or use information, we will update this page and the effective
        date. A new policy version requires a fresh agreement before the set will turn on.
      </p>
    </LegalDocument>
  </main>
</template>
