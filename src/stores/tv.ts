import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { CHANNELS, channelByNumber, formatChannelLabel } from '../data/channels'
import { pickBroadcast, type BroadcastSlot, type CatalogItem } from '../lib/broadcastClock'
import { CHANNEL_ZAP_MS, channelZapNeeded } from '../lib/channelZap'
import { createDigitState, flushDigits, pushDigit, wrapChannel } from '../lib/tuner'
import { createVolumeState, stepVolume, toggleMute, type VolumeState } from '../lib/volume'
import {
  CatalogFetchError,
  fetchChannelCatalog,
  readChannelCatalog,
  MissingApiKeyError,
  QuotaExceededError,
} from '../lib/youtubeData'

import {
  trackChannel,
  playerFailureReason,
  type ChannelEventDetails,
} from '../lib/channelAnalytics'

const VOLUME_KEY = 'pp-volume'
const CHANNEL_KEY = 'pp-channel'
const HUD_MS = 5000
const BRIEF_MS = 2000
const RETRY_MS = 8000
const TUNE_TIMEOUT_MS = 20000

function readChannel(): number {
  try {
    const saved = Number(localStorage.getItem(CHANNEL_KEY))
    if (Number.isInteger(saved) && channelByNumber(saved)) return saved
  } catch {
    // Storage can be disabled; the TV still works for this visit.
  }
  return CHANNELS[0]!.number
}

function readVolume(): VolumeState {
  try {
    const raw = localStorage.getItem(VOLUME_KEY)
    if (!raw) return createVolumeState()
    const parsed = JSON.parse(raw) as Partial<VolumeState>
    return createVolumeState(parsed.volume ?? 80, Boolean(parsed.muted), parsed.lastNonZero)
  } catch {
    return createVolumeState()
  }
}

function writeVolume(state: VolumeState) {
  try {
    localStorage.setItem(VOLUME_KEY, JSON.stringify(state))
  } catch {
    // Sound controls and their readout must work even when preferences cannot be saved.
  }
}

function catalogStorage() {
  return {
    getItem(key: string) {
      try {
        return localStorage.getItem(key) ?? sessionStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key: string, value: string) {
      try {
        localStorage.setItem(key, value)
      } catch {
        try {
          sessionStorage.setItem(key, value)
        } catch {
          /* The TV still works for this visit without a catalog cache. */
        }
      }
    },
  }
}

export const useTvStore = defineStore('tv', () => {
  const poweredOn = ref(false)
  const channelNumber = ref(readChannel())
  const volume = ref(readVolume())
  const hudVisible = ref(true)
  const volumeVisible = ref(false)
  const interruption = ref<'none' | 'brief' | 'hold'>('none')
  const interruptionChannelNumber = ref(channelNumber.value)
  const catalogs = ref<Record<number, CatalogItem[]>>({})
  const skipped = ref<Record<number, string[]>>({})
  const currentSlot = ref<BroadcastSlot | null>(null)
  const playbackRevision = ref(0)
  const pendingDigits = ref('')
  const loading = ref(false)
  const zapping = ref(false)
  const waitingForPlayback = ref(false)
  let tuneTimer = 0

  let hudTimer = 0
  let volumeTimer = 0
  let briefTimer = 0
  let retryTimer = 0
  let zapTimer = 0
  let playedThisTune = false
  const reportedFailures = new Set<string>()
  function beginTune() {
    playedThisTune = false
    reportedFailures.clear()
    trackChannel('channel_select', currentChannel.value)
  }
  function reportFailure(details: ChannelEventDetails) {
    if (!poweredOn.value) return
    const key = JSON.stringify(details)
    if (reportedFailures.has(key)) return
    reportedFailures.add(key)
    trackChannel('channel_error', currentChannel.value, details)
  }
  function onPlayerPlaying(videoId: string) {
    if (!poweredOn.value || videoId !== currentSlot.value?.videoId) return
    finishWaiting()
    if (playedThisTune) return
    playedThisTune = true
    trackChannel('channel_play', currentChannel.value, { video_id: videoId })
  }

  let requestId = 0
  let digitState = createDigitState()

  const currentChannel = computed(() => channelByNumber(channelNumber.value) ?? CHANNELS[0]!)
  const channelLabel = computed(() => formatChannelLabel(currentChannel.value))
  const apiKey = computed(() => import.meta.env.VITE_YOUTUBE_API_KEY ?? '')

  function showHud() {
    hudVisible.value = true
    window.clearTimeout(hudTimer)
    hudTimer = window.setTimeout(() => {
      hudVisible.value = false
    }, HUD_MS)
  }

  function showVolume() {
    volumeVisible.value = true
    window.clearTimeout(volumeTimer)
    volumeTimer = window.setTimeout(() => {
      volumeVisible.value = false
    }, HUD_MS)
  }

  function persistVolume() {
    writeVolume(volume.value)
  }

  function clearRetry() {
    window.clearTimeout(retryTimer)
  }

  function scheduleRetry(channel: number) {
    clearRetry()
    retryTimer = window.setTimeout(() => {
      void loadChannel(channel)
    }, RETRY_MS)
  }

  function hold(channel: number, retry = true) {
    finishWaiting()
    interruption.value = 'hold'
    interruptionChannelNumber.value = channel
    currentSlot.value = null
    if (retry) scheduleRetry(channel)
  }

  function finishWaiting() {
    window.clearTimeout(tuneTimer)
    waitingForPlayback.value = false
  }

  function waitForPlayback(channel: number, request: number) {
    finishWaiting()
    waitingForPlayback.value = true
    tuneTimer = window.setTimeout(() => {
      if (!poweredOn.value || request !== requestId) return
      reportFailure({
        failure_stage: currentSlot.value ? 'player' : 'catalog',
        failure_reason: 'tune_timeout',
      })
      ++requestId
      loading.value = false
      // A silent player failure must not tune the same video on every retry.
      excludeCurrent()
      if (pickBroadcast(catalogs.value[channel] ?? [], Date.now() / 1000, skipped.value[channel])) {
        playFromClock()
      } else {
        hold(channel)
      }
    }, TUNE_TIMEOUT_MS)
  }

  async function loadChannel(channel: number, extraExclude: string[] = [], useCached = true) {
    const mine = ++requestId
    const meta = channelByNumber(channel)
    if (!meta) return

    loading.value = true
    interruptionChannelNumber.value = channel
    interruption.value = 'none'
    waitForPlayback(channel, mine)
    let started = false
    const storage = catalogStorage()
    const excluded = skipped.value[channel] ?? []
    function start(catalog: CatalogItem[]) {
      if (started || mine !== requestId || !poweredOn.value) return
      const slot = pickBroadcast(catalog, Date.now() / 1000, excluded, extraExclude)
      if (!slot) return
      started = true
      clearRetry()
      catalogs.value = { ...catalogs.value, [channel]: catalog }
      interruption.value = 'none'
      currentSlot.value = slot
      playbackRevision.value++
    }

    try {
      if (useCached) start(readChannelCatalog(meta, storage))
      // Consult the persisted timestamp on every tune/programme boundary;
      // reading an old cache must not grant it another 24 hours of freshness.
      const catalog = await fetchChannelCatalog(meta, {
        apiKey: apiKey.value,
        fetchFn: fetch,
        storage,
        excludeIds: excluded,
        onPlayable: start,
      })
      if (mine !== requestId) return
      catalogs.value = { ...catalogs.value, [channel]: catalog }
      start(catalog)
      if (!started) {
        reportFailure({ failure_stage: 'catalog', failure_reason: 'catalog_empty' })
        hold(channel)
        return
      }
    } catch (error) {
      if (mine !== requestId || started) return
      if (error instanceof MissingApiKeyError) {
        console.info('VITE_YOUTUBE_API_KEY is missing')
      } else if (!(error instanceof CatalogFetchError)) {
        console.info(error)
      }
      reportFailure({
        failure_stage: 'catalog',
        failure_reason:
          error instanceof MissingApiKeyError
            ? 'missing_api_key'
            : error instanceof QuotaExceededError
              ? 'quota_exceeded'
              : error instanceof CatalogFetchError
                ? 'catalog_fetch'
                : 'network_error',
      })
      hold(channel, !(error instanceof QuotaExceededError))
    } finally {
      if (mine === requestId) loading.value = false
    }
  }

  function powerOn() {
    if (poweredOn.value) return
    poweredOn.value = true
    beginTune()
    showHud()
    void loadChannel(channelNumber.value)
  }

  function powerOff() {
    finishWaiting()
    poweredOn.value = false
    volumeVisible.value = false
    hudVisible.value = false
    window.clearTimeout(volumeTimer)
    ++requestId
    clearRetry()
    window.clearTimeout(hudTimer)
    window.clearTimeout(briefTimer)
    window.clearTimeout(zapTimer)
    currentSlot.value = null
    loading.value = false
    zapping.value = false
    interruption.value = 'none'
    pendingDigits.value = ''
    digitState = createDigitState()
  }

  function startZap() {
    zapping.value = true
    window.clearTimeout(zapTimer)
    zapTimer = window.setTimeout(() => {
      zapping.value = false
    }, CHANNEL_ZAP_MS)
  }

  function setChannel(next: number) {
    if (!Number.isInteger(next) || !channelByNumber(next)) return
    clearRetry()
    window.clearTimeout(briefTimer)
    if (channelZapNeeded(channelNumber.value, next, poweredOn.value)) {
      startZap()
    }
    const changed = channelNumber.value !== next
    if (changed) currentSlot.value = null
    channelNumber.value = next
    if (changed && poweredOn.value) beginTune()
    try {
      localStorage.setItem(CHANNEL_KEY, String(next))
    } catch {
      // Keep tuning even when the browser cannot save the preference.
    }
    pendingDigits.value = ''
    digitState = createDigitState()
    showHud()
    void loadChannel(next)
  }

  function channelStep(delta: number) {
    setChannel(wrapChannel(channelNumber.value, delta))
  }

  function applyDigitResult(channel: number | null, digits: string) {
    pendingDigits.value = digits
    showHud()
    if (channel) setChannel(channel)
  }

  function typeDigit(digit: string) {
    const result = pushDigit(digitState, digit, Date.now())
    digitState = result.state
    applyDigitResult(result.channel, result.state.digits)
  }

  function tickDigits() {
    const result = flushDigits(digitState, Date.now())
    if (result.channel || result.state.digits !== digitState.digits) {
      digitState = result.state
      applyDigitResult(result.channel, result.state.digits)
    }
  }

  function volumeStep(delta: number) {
    volume.value = stepVolume(volume.value, delta)
    persistVolume()
    showVolume()
  }

  function muteToggle() {
    volume.value = toggleMute(volume.value)
    persistVolume()
    showVolume()
  }

  function playFromClock(extraExclude: string[] = []) {
    const channel = channelNumber.value
    const catalog = catalogs.value[channel] ?? []
    const next = pickBroadcast(
      catalog,
      Date.now() / 1000,
      skipped.value[channel] ?? [],
      extraExclude,
    )
    if (!next) {
      currentSlot.value = null
      void loadChannel(channel)
      return
    }
    interruption.value = 'none'
    waitForPlayback(channel, requestId)
    currentSlot.value = next
    playbackRevision.value++
  }

  function excludeCurrent() {
    const slot = currentSlot.value
    const channel = channelNumber.value
    if (slot) {
      skipped.value = {
        ...skipped.value,
        [channel]: [...(skipped.value[channel] ?? []), slot.videoId],
      }
    }
  }

  function skipCurrent() {
    excludeCurrent()
    playFromClock()
  }

  function onPlayerEnded() {
    const endedId = currentSlot.value?.videoId
    void loadChannel(channelNumber.value, endedId ? [endedId] : [], false)
  }

  function onPlayerError(code?: number, videoId?: string) {
    if (videoId && videoId !== currentSlot.value?.videoId) return
    finishWaiting()
    reportFailure({
      failure_stage: 'player',
      failure_reason: playerFailureReason(code),
      error_code: code === undefined ? '' : String(code),
      video_id: currentSlot.value?.videoId ?? '',
    })
    interruption.value = 'brief'
    interruptionChannelNumber.value = channelNumber.value
    window.clearTimeout(briefTimer)
    briefTimer = window.setTimeout(() => {
      skipCurrent()
    }, BRIEF_MS)
  }

  function onScriptError() {
    reportFailure({ failure_stage: 'script', failure_reason: 'iframe_script_failed' })
    hold(channelNumber.value)
  }

  return {
    poweredOn,
    channelNumber,
    volume,
    hudVisible,
    volumeVisible,
    interruption,
    interruptionChannelNumber,
    currentSlot,
    playbackRevision,
    pendingDigits,
    loading,
    zapping,
    waitingForPlayback,
    currentChannel,
    channelLabel,
    CHANNELS,
    powerOn,
    powerOff,
    setChannel,
    channelStep,
    typeDigit,
    tickDigits,
    volumeStep,
    muteToggle,
    showHud,
    onPlayerPlaying,
    onPlayerEnded,
    onPlayerError,
    onScriptError,
    skipCurrent,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTvStore, import.meta.hot))
}
