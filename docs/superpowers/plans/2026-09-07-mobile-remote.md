# Mobile remote implementation plan

**Goal:** Pair one phone with one desktop TV to change channels, volume, and mute.

**Approved design:** Desktop displays a QR link and expiring short code. `/remote` is a phone-first controller, with current TV state and connection status. Playback remains on desktop. No account, pause, or server-side playback.

**Architecture:** A same-origin WebSocket relay on a small Node server holds temporary sessions in memory. Vite proxies `/remote-ws` during development; production server serves `dist` and the socket from one origin. Desktop alone applies commands to its existing Pinia store and broadcasts resulting state. Tokens authenticate both roles; one-time invitation expires after five minutes. No command queue or replay. Reconnect credentials live in session storage, with a two-minute host reconnect grace and a twelve-hour session cap.

**Constraints:** Preserve CRT styling and existing playback. Do not expose API keys in remote messages. Pairing URLs use fragments for invitation tokens. Validate messages, enforce same-origin socket upgrades, bound session capacity, and rate-limit requests. Public cross-network use requires deploying the Node server behind HTTPS. Local testing uses the desktop's LAN address on both devices.

- [x] Add real WebSocket tests for pairing, command/state forwarding, authorization, one-phone limit, expiry, disconnect, and reconnect.
- [x] Implement `server/sessionHub.mjs` and `server/index.mjs` with `ws`, static serving, cleanup, heartbeat, and production startup script.
- [x] Implement typed protocol and reconnecting browser connection helper. Test command validation and no offline command replay.
- [x] Add desktop pairing component and connect commands/state to the TV store.
- [x] Add responsive `/remote` view with code entry, channel/volume rockers, mute, and numeric keypad.
- [x] Verify backend tests, unit tests, type-check/build, and two-browser end-to-end pairing and controls. Check portrait and desktop screenshots.
- [x] Document local two-device startup, HTTPS deployment, single-process session limits, and pairing expiry.

No Git metadata is present in this workspace; changes will remain as local files.

## Verification

- 36 unit tests and 6 real-WebSocket server tests passed.
- Type-check, production build, and ESLint on changed code passed.
- Two isolated browser contexts verified short-code pairing, QR invitation links, desktop player commands with mocked YouTube, desktop-to-phone state updates, both devices going offline and reconnecting, refresh, and disconnection. Phone layout checked at 320, 390, and 768 pixels.
- Preserved concurrent channel-lineup expansion and used its dynamic channel count in the shared protocol and phone UI.
- Local preview is served on port 8787. Public hosting and physical-device playback were not exercised.
