# CRT YouTube Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. There is no git repository in this workspace; skip commit steps.

**Goal:** Ship a full-viewport CRT television page that plays always-on YouTube broadcasts, with channel flipping, volume UI, living scanlines, and a Doordarshan-style interruption card.

**Architecture:** Pure libs for clock, tuner, and volume (TDD). Pinia `tv` store owns power, channel, volume, HUD, and interruption. Vue layers are YoutubeStage under CrtShell, with ChannelHud, PowerGate, and InterruptionCard on top. YouTube Data API is fetched in the browser with an injected `fetch` so tests never hit Google.

**Tech Stack:** Vue 3, Vite, Pinia, Vue Router, Vitest, YouTube IFrame Player API, YouTube Data API v3.

---

## File map

- Create: `src/lib/volume.ts`, `src/lib/tuner.ts`, `src/lib/broadcastClock.ts`, `src/lib/youtubeData.ts`
- Create: `src/data/channels.ts`
- Create: `src/stores/tv.ts`
- Create: `src/views/PlayerPage.vue`
- Create: `src/components/CrtShell.vue`, `YoutubeStage.vue`, `ChannelHud.vue`, `PowerGate.vue`, `InterruptionCard.vue`
- Create: `src/styles/crt.css`
- Create: `src/__tests__/volume.spec.ts`, `tuner.spec.ts`, `broadcastClock.spec.ts`, `youtubeData.spec.ts`
- Modify: `src/App.vue`, `src/router/index.ts`, `src/main.ts`, `index.html`, `README.md`
- Create: `.env.example`
- Delete: `src/stores/counter.ts`
- Modify: `src/__tests__/App.spec.ts` (PlayerPage mount, not "You did it!")

---

### Task 1: Volume lib

**Files:**
- Create: `src/__tests__/volume.spec.ts`
- Create: `src/lib/volume.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { createVolumeState, stepVolume, toggleMute } from '../lib/volume'

describe('volume', () => {
  it('steps up five from 80 to 85', () => {
    expect(stepVolume(createVolumeState(80), 5).volume).toBe(85)
  })
  it('clamps up at 100', () => {
    expect(stepVolume(createVolumeState(100), 5).volume).toBe(100)
  })
  it('clamps down at 0 and mutes', () => {
    const next = stepVolume(createVolumeState(5, false, 5), -5)
    expect(next.volume).toBe(0)
    expect(next.muted).toBe(true)
  })
  it('keeps last level when muted', () => {
    const muted = toggleMute(createVolumeState(80, false))
    expect(muted.muted).toBe(true)
    expect(muted.volume).toBe(80)
  })
  it('restores last non-zero on unmute', () => {
    const muted = toggleMute(createVolumeState(80, false))
    const unmuted = toggleMute(muted)
    expect(unmuted.muted).toBe(false)
    expect(unmuted.volume).toBe(80)
  })
  it('unmutes and steps up when raising while muted', () => {
    const next = stepVolume(createVolumeState(80, true, 80), 5)
    expect(next.muted).toBe(false)
    expect(next.volume).toBe(85)
  })
})
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/__tests__/volume.spec.ts`  
Expected: FAIL, cannot find module `../lib/volume`

- [ ] **Step 3: Implement**

```ts
export type VolumeState = {
  volume: number
  muted: boolean
  lastNonZero: number
}

export function createVolumeState(
  volume = 80,
  muted = false,
  lastNonZero = Math.max(volume, 5),
): VolumeState {
  return { volume, muted, lastNonZero: lastNonZero || 5 }
}

export function stepVolume(state: VolumeState, delta: number): VolumeState {
  if (state.muted && delta > 0) {
    const volume = Math.min(100, state.lastNonZero + delta)
    return { volume, muted: false, lastNonZero: Math.max(volume, 5) }
  }
  const volume = Math.min(100, Math.max(0, state.volume + delta))
  return {
    volume,
    muted: volume === 0,
    lastNonZero: volume > 0 ? volume : state.lastNonZero,
  }
}

export function toggleMute(state: VolumeState): VolumeState {
  if (state.muted) {
    const volume = Math.max(state.lastNonZero, 5)
    return { volume, muted: false, lastNonZero: volume }
  }
  return { ...state, muted: true, lastNonZero: Math.max(state.volume, 5) }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/__tests__/volume.spec.ts`  
Expected: PASS

- [ ] **Step 5: Skip commit** (no git repo)

---

### Task 2: Tuner lib

**Files:**
- Create: `src/__tests__/tuner.spec.ts`
- Create: `src/lib/tuner.ts`

- [ ] **Step 1: Write the failing tests** for `wrapChannel` (1↔12) and digit entry (`03` → 3, `11` → 11, lone `3` after 1200ms → 3, `99` ignored).

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/__tests__/tuner.spec.ts`

- [ ] **Step 3: Implement `wrapChannel`, `pushDigit`, `flushDigits`**

`pushDigit(state, digit, now)` starts or continues a pending string. A second digit within 1200ms commits a two-digit number if 1-12, else ignores. `flushDigits(state, now)` after 1200ms commits a single digit 1-9 (and 0 as ignored).

- [ ] **Step 4: Run to verify pass**

- [ ] **Step 5: Skip commit**

---

### Task 3: Broadcast clock

**Files:**
- Create: `src/__tests__/broadcastClock.spec.ts`
- Create: `src/lib/broadcastClock.ts`

- [ ] **Step 1: Write failing tests** using catalog `[{id:a, 100s}, {id:b, 50s}]`:
  - utc 10 → a @ 10
  - utc 100 → b @ 0
  - utc 160 → a @ 10 (loop 150)
  - empty → null
  - exclude `a` then pick from remainder

- [ ] **Step 2: Run to verify fail**

- [ ] **Step 3: Implement `pickBroadcast(catalog, utcSeconds, excludeIds?)`**

- [ ] **Step 4: Run to verify pass**

- [ ] **Step 5: Skip commit**

---

### Task 4: YouTube Data client

**Files:**
- Create: `src/__tests__/youtubeData.spec.ts`
- Create: `src/lib/youtubeData.ts`
- Create: `src/data/channels.ts`

- [ ] **Step 1: Write failing tests** with a fake `fetch` that returns search results + `videos.list` durations. Assert ISO `PT1M40S` becomes 100 seconds, unembeddable rows dropped, missing key throws a typed error.

- [ ] **Step 2: Run to verify fail**

- [ ] **Step 3: Implement `parseIsoDuration`, `fetchChannelCatalog(channel, { apiKey, fetchFn, storage })`. Cache JSON in `sessionStorage` keyed `pp-catalog-${number}`.**

- [ ] **Step 4: Add `CHANNELS` array matching the spec table.**

- [ ] **Step 5: Run to verify pass**

- [ ] **Step 6: Skip commit**

---

### Task 5: Pinia store + player page UI

**Files:** listed in file map above

- [ ] **Step 1: Replace App.spec** so it mounts the app with pinia+router and looks for `Press to turn on` instead of `You did it!`

- [ ] **Step 2: Run to verify fail**

- [ ] **Step 3: Implement store, components, styles, router `/` → PlayerPage, delete counter store, title `Positive Player`, `.env.example`, README key setup.**

HUD: phosphor green, VOL left, CH right, ten-tick bar. CRT: scanlines + grain overlay, vignette, reduced-motion still. Interruption: Hindi `रुकावट के लिए खेद है` + `Sorry for the interruption`. YoutubeStage loads IFrame API, `playerVars` from spec, applies volume/mute, on ended/error asks store to skip.

- [ ] **Step 4: Run `npx vitest run` and `npm run type-check`**

- [ ] **Step 5: Browser-verify power on, HUD, scanlines, channel keys, volume, interruption if no API key**

---

## Spec coverage

| Spec | Task |
| Volume step/mute | 1 |
| Tuner wrap + digits | 2 |
| Clock + skip exclude | 3 |
| Data API + cache + lineup | 4 |
| CRT UI, HUD, power, interruption, IFrame | 5 |
