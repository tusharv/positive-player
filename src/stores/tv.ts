import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { CHANNELS, channelByNumber, formatChannelLabel } from '../data/channels'
import { pickBroadcast, type BroadcastSlot, type CatalogItem } from '../lib/broadcastClock'
import { CHANNEL_ZAP_MS, channelZapNeeded } from '../lib/channelZap'
import { createDigitState, flushDigits, pushDigit, wrapChannel } from '../lib/tuner'
import {
  createVolumeState,
  stepVolume,
  toggleMute,
  type VolumeState,
} from '../lib/volume'
import {
  CatalogFetchError,
  fetchChannelCatalog,
  MissingApiKeyError,
  QuotaExceededError,
} from '../lib/youtubeData'

const VOLUME_KEY = 'pp-volume'
const CHANNEL_KEY = 'pp-channel'
const HUD_MS = 3000
const BRIEF_MS = 2000
const RETRY_MS = 8000

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
  localStorage.setItem(VOLUME_KEY, JSON.stringify(state))
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
  const interruption = ref<'none' | 'brief' | 'hold'>('none')
  const interruptionChannelNumber = ref(channelNumber.value)
  const catalogs = ref<Record<number, CatalogItem[]>>({})
  const skipped = ref<Record<number, string[]>>({})
  const currentSlot = ref<BroadcastSlot | null>(null)
  const pendingDigits = ref('')
  const loading = ref(false)
  const zapping = ref(false)

  let hudTimer = 0
  let briefTimer = 0
  let retryTimer = 0
  let zapTimer = 0
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
    interruption.value = 'hold'
    interruptionChannelNumber.value = channel
    currentSlot.value = null
    if (retry) scheduleRetry(channel)
  }

  async function loadChannel(channel: number) {
    const mine = ++requestId
    const meta = channelByNumber(channel)
    if (!meta) return

    loading.value = true
    interruptionChannelNumber.value = channel
    showHud()

    try {
      let catalog = catalogs.value[channel]
      if (!catalog) {
        catalog = await fetchChannelCatalog(meta, {
          apiKey: apiKey.value,
          fetchFn: fetch,
          storage: catalogStorage(),
        })
        if (mine !== requestId) return
        catalogs.value = { ...catalogs.value, [channel]: catalog }
      }

      const slot = pickBroadcast(
        catalog,
        Date.now() / 1000,
        skipped.value[channel] ?? [],
      )
      if (mine !== requestId) return

      if (!slot) {
        hold(channel)
        return
      }

      clearRetry()
      interruption.value = 'none'
      currentSlot.value = slot
    } catch (error) {
      if (mine !== requestId) return
      if (error instanceof MissingApiKeyError) {
        console.info('VITE_YOUTUBE_API_KEY is missing')
      } else if (!(error instanceof CatalogFetchError)) {
        console.info(error)
      }
      hold(channel, !(error instanceof QuotaExceededError))
    } finally {
      if (mine === requestId) loading.value = false
    }
  }

  function powerOn() {
    poweredOn.value = true
    showHud()
    void loadChannel(channelNumber.value)
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
    channelNumber.value = next
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
    showHud()
  }

  function muteToggle() {
    volume.value = toggleMute(volume.value)
    persistVolume()
    showHud()
  }

  function playFromClock(extraExclude: string[] = []) {
    const channel = channelNumber.value
    const catalog = catalogs.value[channel] ?? []
    const exclude = [...(skipped.value[channel] ?? []), ...extraExclude]
    const next = pickBroadcast(catalog, Date.now() / 1000, exclude)
    if (!next) {
      hold(channel)
      return
    }
    interruption.value = 'none'
    currentSlot.value = next
  }

  function skipCurrent() {
    const slot = currentSlot.value
    const channel = channelNumber.value
    if (slot) {
      skipped.value = {
        ...skipped.value,
        [channel]: [...(skipped.value[channel] ?? []), slot.videoId],
      }
    }
    playFromClock()
  }

  function onPlayerEnded() {
    const endedId = currentSlot.value?.videoId
    playFromClock(endedId ? [endedId] : [])
  }

  function onPlayerError() {
    interruption.value = 'brief'
    interruptionChannelNumber.value = channelNumber.value
    window.clearTimeout(briefTimer)
    briefTimer = window.setTimeout(() => {
      skipCurrent()
    }, BRIEF_MS)
  }

  function onScriptError() {
    hold(channelNumber.value)
  }

  return {
    poweredOn,
    channelNumber,
    volume,
    hudVisible,
    interruption,
    interruptionChannelNumber,
    currentSlot,
    pendingDigits,
    loading,
    zapping,
    currentChannel,
    channelLabel,
    CHANNELS,
    powerOn,
    setChannel,
    channelStep,
    typeDigit,
    tickDigits,
    volumeStep,
    muteToggle,
    showHud,
    onPlayerEnded,
    onPlayerError,
    onScriptError,
    skipCurrent,
  }
})
