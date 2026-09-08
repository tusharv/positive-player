# CRT YouTube Player

Date: 2026-09-07  
Project: positive-player  
Status: approved

## Problem

`positive-player` is a blank Vue 3 + Vite + Pinia + Vue Router app. We need a single player page that feels like an always-on CRT television. Viewers flip channels when they do not like what is on. Videos come from YouTube.

## Approach

CRT shell + YouTube IFrame Player API + YouTube Data API v3. One Vue page. Channel lineup lives in a local config file. A broadcast clock picks which video is "on air" and how far in.

## Out of scope (v1)

- In-app channel tuner or editor
- Backend or serverless YouTube proxy
- Shared server-side schedule (clock is computed in the browser from UTC)
- Official Doordarshan logo or wordmark
- Extra routes (about, settings)

## Architecture

The app stays a Vue 3 + Vite SPA. Route `/` is the TV. No other routes in v1.

Layers on the player page, back to front:

1. `YoutubeStage`: IFrame Player, YouTube chrome hidden
2. `CrtShell`: scanlines, grain, vignette, curved glass. `pointer-events: none` except where controls sit
3. `ChannelZap`: analog snow and horizontal tear, only while flipping
4. `ChannelHud`: channel number, name, CH+/−, VOL+/−, volume bar
5. `PowerGate`: shown only while off
6. `InterruptionCard`: shown when a video or channel cannot play

Pinia store `tv` is the only place UI talks to playback. It holds:

- `poweredOn: boolean`
- `channelNumber: number` (1 through the current lineup)
- `volume: number` (0-100, step 5, default 80)
- `muted: boolean`
- `hudVisible: boolean`
- `interruption: 'none' | 'brief' | 'hold'`
- `interruptionChannelNumber: number` (the channel shown on the card)
- `zapping: boolean`

`volume` and `muted` persist in `localStorage` so a refresh keeps the last level. Channel number does not persist.

Pure modules, no Vue:

- `src/data/channels.ts`: lineup
- `src/lib/youtubeData.ts`: Data API (search, playlist items, video durations)
- `src/lib/broadcastClock.ts`: `{ videoId, startSeconds }` from a catalog and a UTC timestamp
- `src/lib/tuner.ts`: wrap, digit entry
- `src/lib/volume.ts`: clamp 0-100, step by 5, mute/unmute without losing the last non-zero level
- `src/lib/channelZap.ts`: whether a flip should burst, and how long the snow lasts

Env: `VITE_YOUTUBE_API_KEY`. Restrict the key by HTTP referrer in Google Cloud. Document this in the project README. Do not commit the key.

Catalogs cache in `sessionStorage` keyed by channel number so flipping back does not burn quota.

```
power on
  → load channel catalog for current channel
  → clock(now) → { videoId, startSeconds }
  → iframe plays after the click at stored volume (muted if stored muted)

channel change
  → analog snow + horizontal tear for 420ms
  → load catalog if missing
  → clock(now) on the new channel
  → snow lifts on the new picture (scanlines stay)
```

## The set

The browser viewport is the CRT glass. No living-room set, no remote graphic, no site header or footer.

**Off.** Dark glass. Centered copy: `Press to turn on`. That click is the required user gesture. It sets `poweredOn`, starts the current broadcast, and unmutes unless the viewer has already muted.

**On.** YouTube plays under the glass. Scanlines and grain stay on every frame. After power-on or a channel change, the HUD shows `CH 003  NATURE` (zero-padded number, uppercase name), CH+/− on the right, and VOL+/− on the left. After 3 seconds with no input, the HUD fades. Any key, click, or pointer move shows it again.

**Volume bar.** Changing volume or mute shows a phosphor bar under the channel name: ten ticks, each tick is 10%. The current level fills from the left. Mute shows the bar empty and a `MUTE` tag. The bar uses the same 3-second HUD fade.

**CRT treatment.** Living scanlines and animated grain sit on every video. Changing channel (CH+/−, arrows, or a committed number) fires a 420ms analog zap: full-screen snow, a horizontal sync tear, and a short vertical roll. The new broadcast loads underneath so the snow lifts onto the new picture. Power-on and landing on the same channel do not zap. Rapid flips restart the burst. Grain and scanlines are a CSS overlay on the iframe (`pointer-events: none`). Do not use a CSS `filter` on the iframe itself. `prefers-reduced-motion: reduce` keeps still scanlines, disables grain motion, and replaces the zap with a brief dark frame.

`html` and `body` are black, no margin. Document title is `Positive Player`.

**YouTube chrome.** IFrame `playerVars`: `autoplay: 1`, `controls: 0`, `disablekb: 1`, `fs: 0`, `modestbranding: 1`, `rel: 0`, `iv_load_policy: 3`, `playsinline: 1`, plus `origin` set to `window.location.origin`.

**Controls.**

- On-glass CH+ / CH− (right)
- On-glass VOL+ / VOL− (left)
- Arrow up / right: next channel
- Arrow down / left: previous channel
- Digit keys: three-digit entry with a 1.2s commit window (type `0` `0` `3` for Nature; `0` `1` `1` for Bollywood; `1` `0` `0` for Olympics). A shorter number that is not followed by more digits tunes that channel after the window (`3` → CH 003, `03` → CH 003). Numbers outside the lineup are ignored. The HUD stays visible while digits are being entered.
- `+` or `=`: volume up 5
- `-`: volume down 5
- `M` toggles mute

Volume is applied through the IFrame API (`setVolume`, `mute`, `unMute`). Steps clamp at 0 and 100. VOL+ while muted unmutes and steps up. VOL− to 0 also sets muted. Unmute restores the last non-zero level (minimum 5). Power-on applies the stored volume and mute state to the player.

## Channels and broadcast clock

The built-in lineup lives in `src/data/channels.ts` (120 search channels). Each row has a name, YouTube query, blurb, mood, and category. Any row may later switch to `playlist` by setting `kind: 'playlist'` and `playlistId`. The TV code treats both kinds the same after the catalog is fetched. Channel labels pad to three digits (`CH 009  CLASSIC MUSIC`).

Search params: `type=video`, `safeSearch=strict`, `videoEmbeddable=true`, `videoSyndicated=true`, `maxResults=25`. Then `videos.list` for `contentDetails.duration` and `status.embeddable`. Drop videos that are not embeddable or have no duration.

**Clock.** Sum remaining durations into `loopLength` seconds.  
`offset = floor(utcSeconds) % loopLength`.  
Walk the catalog until `offset` falls inside a video. Return that `videoId` and `startSeconds`.  
The same channel at the same UTC second returns the same pair.

When a video ends, call the clock again with `now`. Do not use YouTube's next-up. If the player reports an error, treat it as a skip (see Errors).

Skip must not land on the same broken id. The in-memory catalog for that channel drops that `videoId` for the rest of the tab session, then the clock runs again on what remains. If nothing remains, the channel is empty.

If every item was dropped, the catalog is empty and the channel goes to a held interruption card.

## Errors

Never show a YouTube error page or a generic `NO SIGNAL` label.

**Interruption card** (homage, not an official mark):

- Hindi: `रुकावट के लिए खेद है`
- English, smaller, uppercase tracking: `Sorry for the interruption`
- Tiny channel tag in the corner: `CH 11  BOLLYWOOD`
- Black glass, cream type, saffron-gold-green hairline above the Hindi
- Scanlines remain
- No `दूरदर्शन` wordmark, no official DD logo

**Brief interruption.** Player error or unembeddable slot: show the card for 2 seconds, then ask the clock for the next playable slot on the same channel (walk forward, wrapping once). If none, become a hold.

**Hold interruption.** Empty catalog, missing API key, quota error, network failure, or IFrame API script failed to load: keep the card up. Retry the catalog fetch every 8 seconds (script load is retried the same way). Flipping channels cancels the retry on the old channel. Missing key also logs `VITE_YOUTUBE_API_KEY is missing` to the console so local setup is obvious. The card itself stays in the voice of the set (Hindi + English only).

## Testing

Use the existing Vitest setup. Do not call Google from CI. Mock Data API and the IFrame player.

Must cover:

1. Clock: fixed catalog + fixed timestamp → same `videoId` and `startSeconds`
2. Clock: timestamp just past a video boundary → next item
3. Clock: past the last video → first video
4. Clock: all items unembeddable → empty catalog
5. Tuner: CH+ on the last channel → 1; CH− on 1 → last
6. Digit entry: `003` → 3; `011` → 11; `100` → 100; lone `3` after timeout → 3; `999` ignored
7. Skip: current slot unembeddable → next embeddable slot
8. Volume: +5 from 80 → 85; +5 from 100 → 100; −5 from 0 → 0
9. Mute: mute keeps last level; unmute restores it; VOL+ while muted unmutes

Manual check before calling v1 done:

- Power-on click starts picture and sound at the stored volume
- VOL+/− and `+`/`-` move the on-glass bar
- `M` mutes and unmutes
- Scanlines sit on the playing video
- Channel flip shows analog snow, then the new picture
- Dead channel shows the interruption card
- Reduced motion: grain does not animate

## File map

```
src/App.vue                         # router-view only
src/router/index.ts                 # / → PlayerPage
src/views/PlayerPage.vue
src/components/CrtShell.vue
src/components/YoutubeStage.vue
src/components/ChannelHud.vue
src/components/ChannelZap.vue
src/components/PowerGate.vue
src/components/InterruptionCard.vue
src/stores/tv.ts
src/data/channels.ts
src/lib/youtubeData.ts
src/lib/broadcastClock.ts
src/lib/tuner.ts
src/lib/volume.ts
src/lib/channelZap.ts
src/__tests__/broadcastClock.spec.ts
src/__tests__/tuner.spec.ts
src/__tests__/volume.spec.ts
src/__tests__/channelZap.spec.ts
```

Remove the scaffold counter store and the "You did it!" `App.vue` copy.

## Success

A visitor opens `/`, clicks to turn the set on, and is already in the middle of a video. Scanlines stay on the picture. CH+/− or number keys zap through analog snow onto another broadcast mid-stream. VOL+/− and `+`/`-` change the on-glass volume bar. If something cannot play, they see `रुकावट के लिए खेद है`, not a YouTube error.
