# positive-player

Always-on CRT television that plays YouTube through the IFrame Player API. Flip channels. Volume lives on the glass.

The TV remembers the last selected channel and sound settings in this browser across reloads and restarts, including channel changes made from a paired phone. Turn it on to return to that channel's current broadcast. Clearing browser storage resets these preferences; an unavailable saved channel falls back to the first channel.

## Channel guide

After turning on the TV, choose **Guide** in the lower-left corner. Search by channel name, number, description, or tag, and combine the search with a tag filter. Select a channel to tune in; press Escape or Back to TV to return to the TV. The guide fills the CRT screen within its bezel. Each channel has category and mood tags, with additional tags for classic shows.

Channels 121–125 are **DD Classics**, **Ramayan**, **Mahabharat**, **Jungle Book**, and **Shaktimaan**. Choose the **DD Era** tag to find them together. They use YouTube searches aimed at original Hindi episodes; results and availability can vary, and the mixed channel does not guarantee a rotation of all four shows. Existing channel numbers are unchanged.

## YouTube API compliance

Google’s YouTube API review needs public, no-login URLs. After you deploy, paste these into the API project:

- Privacy Policy: `https://positive-player.vercel.app/privacy`
- Terms of Service: `https://positive-player.vercel.app/terms`

The power-on screen requires agreement to both, plus a link to the [YouTube Terms of Service](https://www.youtube.com/t/terms), before the Data API or IFrame Player run.

## YouTube API key

Copy `.env.example` to `.env` and set `VITE_YOUTUBE_API_KEY`. Enable YouTube Data API v3 on the key and restrict it by HTTP referrer to your origin. Without a key, the set turns on and shows the interruption card.

Do not commit `.env`.

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
