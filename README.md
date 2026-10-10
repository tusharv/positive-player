# positive-player

A CRT television for anyone done with reels. It plays YouTube in the browser, already in the middle of a programme, with the player controls hidden so there is nothing to skip. Change the channel, or stay with the picture. Volume lives on the glass.

Live at [https://1988-in.vercel.app/](https://1988-in.vercel.app/).

The TV remembers the last selected channel and sound settings in this browser across reloads and restarts, including channel changes made from a paired phone. Turn it on to return to that channel's current broadcast. Clearing browser storage resets these preferences; an unavailable saved channel falls back to the first channel.

## Channel guide

After turning on the TV, choose **Channels** in the on-screen controls. Search by channel name, number, description, or tag, and combine the search with a tag filter. Select a channel to tune in; press Escape or Back to TV to return to the TV. The guide fills the CRT screen within its bezel. Each channel has category and mood tags, with additional tags for classic shows.

Use **CH − / CH +** to change channels without pairing a phone. Arrow keys move between focused controls; Enter selects one. Use **VOL − / VOL +** for 5% volume steps and **Mute / Unmute** to toggle sound and restore the previous volume. Number keys, volume (+/−), and M for mute still work while a control is focused.

The HUD and controls fade away after four seconds of inactivity. Move the mouse, tap the picture, or use the keyboard/TV remote to reveal them. The first tap, arrow, or OK press wakes hidden controls without selecting a channel. The Channels guide and phone-pairing dialog stay visible while open. Reduced-motion preferences disable the animation.

Choose **Fullscreen** to expand the player, including its channel controls. Use **Exit fullscreen**, Escape, or the TV Back key to return. If the browser cannot enter native fullscreen, a message explains that the player fills the browser window while its toolbar may remain visible.

The lineup opens with **001 Bollywood**, **002 Cricket**, **003 Jungle Book**, **004 Shaktimaan**, **005 DD Classics**, **006 Ramayan**, and **007 Mahabharat**, followed by animals, food, space, sport, and travel. Quieter scenery and ambient channels follow the opening selection. Choose the **DD Era** tag to find the classic TV channels and **013 Vintage India**, a curated selection of vintage ads, public-service films, and broadcast interludes. Every channel has bundled video IDs, titles, and durations. The checked-in channel lists are the source of truth; refreshes preserve their existing curation and add source-specific programming. `src/data/handPickedPrograms.ts` retains the original seed selections. Each channel has its own file in `src/data/programs/`; `src/data/curatedPrograms.ts` is a lightweight index of versions and lazy loaders. The player downloads only the selected channel’s list and reuses it on later visits. The home page, channel guide, and remote do not load programme lists. Playback never needs Search Queries quota. Cricket rotates memorable innings and performances from Sachin Tendulkar, Rahul Dravid, MS Dhoni, Sunil Gavaskar, and other legends. Channel numbers have changed; saved preferences still recall a channel number, which may now point to different programming.

## Content rotation and source checks

Each station uses its own bundled selection so every channel can start once its small data file loads, even without a Data API key, browser cache, or during a metadata outage. Internet access to the YouTube iframe is still required; these are video lists, not downloaded videos. Runtime metadata validation removes unavailable videos; a changed curated selection gets a new cache key. If that source has no playable videos, the TV shows an interruption instead of silently substituting another channel. Topic filters keep mixed publisher feeds relevant where configured; changing a source or filter also changes its cache key.

Catalogs refresh after 24 hours, including on the next programme transition in a TV session left open. Optional runtime validation checks the bundled IDs with `videos.list`. New uploads enter the lineup when the bundles are regenerated and deployed. The UTC date rotates the starting programme (an already-playing programme finishes before adopting the new day’s schedule), so a short catalog no longer always repeats the same daily timetable. Videos still repeat once a finite catalog is exhausted; this does not guarantee seven days of unique programming. If a refresh fails, the same station's cached catalog remains available; every station also has its bundled selection. Stalled or rejected videos are skipped. An exhausted catalog can refresh early, with a five-minute cooldown to avoid repeated API requests. When editing curated programming, use relevant videos from official publishers, update the stored durations, and verify embedding in the actual player as well as the Data API.

Public playlists can contain private, deleted, short, or non-embeddable videos. The loader checks individual video metadata before scheduling them. A live source audit is a point-in-time check, not a guarantee of future availability or playback in every region.

## Channel analytics

Channel selections, confirmed playback starts, and deduplicated failures are available to Google Analytics through the existing GTM container and to Microsoft Clarity. Follow [the channel analytics setup guide](docs/channel-analytics.md) to connect the events and create Popular channels and Channel failures reports. The code alone does not publish your analytics tags or configure reports in your accounts.

## YouTube API compliance

Google’s YouTube API review needs public, no-login URLs. After you deploy, paste these into the API project:

- Privacy Policy: `https://1988-in.vercel.app/privacy`
- Terms of Service: `https://1988-in.vercel.app/terms`

The power-on screen requires agreement to both, plus a link to the [YouTube Terms of Service](https://www.youtube.com/t/terms), before the Data API or IFrame Player run.

## YouTube API key

Copy `.env.example` to `.env` and set `VITE_YOUTUBE_API_KEY`. Enable YouTube Data API v3 on the key and restrict it by HTTP referrer to your origin. Without a key, every channel can still play through the YouTube iframe. The key is optional for playback and enables metadata validation. Allow both `https://1988.in/*` and `https://www.1988.in/*` when restricting the deployed key by website. Set `VITE_GTM_ID` to the Google Tag Manager container ID; leave it blank to omit the tag. Vite inlines that ID at build time, so production and preview deploys need the same variable in the host environment.

All deployed channels validate their explicit IDs with `videos.list`; viewers do not load playlists or run searches. To refresh the generated bundles, set `VITE_YOUTUBE_API_KEY` in `.env.local` or the environment and run `npm run bundle:programs`. Set `YOUTUBE_REFERER` if the key permits a different website. The generator scans existing playlist sources and applies the channel topic filters; Football and missing or empty sources use their own search query. It merges metadata-checked additions into the existing channel lists without the old 50-video truncation, preserves the expanded hand-picked channels, archives the previous lists, and refuses to replace the bundles if any generated source has fewer than three videos. It writes the individual channel files and updates their content versions so changed programming does not reuse a stale catalog. Generation uses API quota and runs only when explicitly requested, never during a normal build. Review the generated programming, run the tests, and deploy to publish updated lists. Metadata checks cannot guarantee iframe playback in every region.

For deeper collection, run `npm run refresh:weekly`. This validates current IDs, adds the reviewed candidates in `scripts/weekly-supplements.json`, and scans up to 100 pages of each configured playlist until the channel reaches 168 hours. It checks public visibility, embedding, duration, India availability, age restrictions, and live status. It skips the known iframe-blocked Formula 1 upload feed. The script preserves editorial labels and prioritizes additions over retained entries. Every run first saves an immutable snapshot in `docs/content-history/`. Temporary API responses in `.content-refresh/` are ignored by Git and expire after 24 hours.

Weekly refreshes write improved bundles even when some channels are still short, write the per-channel results to `docs/weekly-content-audit.json`, and return exit code **2** for incomplete coverage or API errors. This is deliberately not a success signal for a full week's programming. Run `npm run audit:content` for an offline check of unique IDs, valid entries, and at least **604,800 seconds per channel**; it exits nonzero if any channel fails. Counts establish distinct video IDs, not proof that compilations or reuploads contain entirely different footage. Bollywood additionally requires an explicit publisher video label and rejects audio, lyrical, visualizer, karaoke, instrumental, lofi, and ambiguous entries. This rule is enforced during weekly collection and before bundle publication; its hand-picked reference follows the current video-only list.

See the [10 October expansion audit](docs/content-audit-2026-10-10.md) for measured coverage and remaining gaps, and [content history](docs/content-history/README.md) for the prior lists. The 168-hour requirement is not yet met by every channel. Narrow series and topics must be curated further rather than padded with repeat entries or inflated durations.

Do not commit `.env`.

## Channel debug

Open the internal page at `/debug` directly to inspect each channel's scheduled video, YouTube link, clock offset, duration, and catalog status. Search by channel name, number, category, video title, or ID. Cached schedules appear immediately and update every second; use **Load / refresh** for one channel or **Load / refresh all catalogs** for the lineup.

This is read-only debugging: it reads existing TV caches but keeps fetched catalogs and quota cooldowns in memory for this page visit only. It never writes browser storage or changes TV settings or playback. Loading uses the same API key and 24-hour cache policy as the TV, with up to three channel requests running at once. Missing or expired catalogs use YouTube API quota; failed refreshes may reuse an older catalog. Older cached entries may have no title until refreshed. The page shows schedules, not confirmed playback from another tab or device; skipped videos and different cached catalogs can change what a viewer sees.

## Use your phone as a remote

1. Run `npm run dev`. This starts the TV on port 5173 and its remote service on port 8787.
2. On the desktop, open the **Network** address printed by Vite (for example, `http://192.168.1.2:5173`). Use the computer's Wi-Fi/LAN address, not `localhost`, so the phone can reach it. Both devices must be on the same network for local development; allow access through the computer's firewall if needed.
3. Turn on the desktop TV, then choose **Connect remote** in the lower-right corner.
4. Scan the QR code on your phone, or open `/remote` at the same address and enter the eight-character code.

The phone controls power, channels, volume, and mute. The number pad follows the current channel lineup; shorter numbers commit after a brief pause. The desktop sends its actual state back to the phone, including changes made with its own controls. Video and sound stay on the desktop. After accepting the station notice on the desktop, the remote’s Power button toggles the TV on and off while keeping the phone paired. Browser autoplay restrictions may still require a desktop interaction to resume sound.

One phone can pair with each TV. Pairing invitations expire after five minutes and are consumed on first use. Either device can disconnect. Refreshing or briefly losing connection resumes using credentials stored only for that browser tab; offline button presses are not queued. A disconnected desktop has two minutes to reconnect. Sessions expire after twelve hours, and restarting the server requires pairing again.

### Hosting with remote control

Run `npm run build`, then `npm start`. The Node server serves the built site and `/remote-ws` on port **8787** (`PORT` overrides it). Use the Node version specified in `package.json`; the server shares a TypeScript protocol module through Node's built-in type stripping. Keep the repository source alongside `dist` when deploying.

For devices on different networks, deploy this server at a public **HTTPS** address. The browser automatically uses secure WebSockets on HTTPS. A static-only deployment or `npm run preview` does not provide the remote relay by itself. On Vercel, `/remote-ws` is served by `api/remote-ws.mjs` so phone pairing can work on the same HTTPS origin. For a self-hosted Node process, run `npm start` and configure your reverse proxy to forward WebSocket upgrades for `/remote-ws`, preserve the host header, and allow idle connections for at least 60 seconds. Set `PUBLIC_ORIGIN` to the exact public origin, for example `https://tv.example.com`.

Rate limits use the direct peer's address by default. Behind a trusted reverse proxy, set `TRUST_PROXY=1` only when the Node port is private and the proxy appends or overwrites `X-Forwarded-For` with the real client address. The rightmost forwarded address is used. Do not enable this for a server directly exposed to the internet.

This first version uses one Node process and temporary in-memory sessions (up to 1,000 TVs). Multiple replicas need shared session storage and message routing before they can serve the same paired devices. Video traffic goes directly to YouTube, not through this server.

Verify changes with `npm run test:server`, `npm run test:unit -- --run`, and `npm run build`. Server tests use real WebSocket connections; playback tests mock YouTube and do not spend API quota.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### DD Classics (Channel 005)

Channel 005 has a curated 34-day rotation of DD serials, comedy, culture, and vintage advertisements. See the [content audit](docs/dd-classics-catalogue.md) and [complete ordered catalogue](docs/dd-classics-catalogue.csv) for sources, durations, and availability gaps. Its bundle is also its hand-picked source, so catalogue regeneration preserves the mixed selection. Multi-day catalogues play continuously across midnight; shorter catalogues keep their daily rotation. Curated validation checks the whole selection and retains short ad spots and editorial labels.

### Vintage India (Channel 013)

Replaces Kindness with 198 curated videos across public-service films and broadcast atmosphere; transport, clothing and electronics ads; food and drink ads; and household, personal-care and health ads. The selection runs for 2 hours 50 minutes and preserves original short spots. See the [content audit](docs/vintage-india-catalogue.md) and [full ordered catalogue](docs/vintage-india-catalogue.csv). Its hand-picked source preserves the selection during regeneration.
