<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hasHardwareVideoPlane } from '../lib/hardwareVideoPlane'

type YtPlayer = {
  loadVideoById: (opts: { videoId: string; startSeconds: number }) => void
  setVolume: (n: number) => void
  mute: () => void
  unMute: () => void
  destroy: () => void
  unloadModule?: (module: string) => void
  getIframe?: () => HTMLIFrameElement
}

const props = defineProps<{
  videoId: string
  startSeconds: number
  volume: number
  muted: boolean
  playbackRevision?: number
}>()

const emit = defineEmits<{
  ended: []
  playing: [videoId: string]
  error: [code?: number, videoId?: string]
  'script-error': []
}>()

const host = ref<HTMLDivElement | null>(null)
let player: YtPlayer | null = null
let destroyed = false

function disableCaptions() {
  // YouTube exposes this at runtime, but does not document a force-off API.
  // Keep playback working if the optional method is unavailable.
  player?.unloadModule?.('captions')
}

function applySound() {
  if (!player) return
  player.setVolume(props.volume)
  if (props.muted || props.volume === 0) player.mute()
  else player.unMute()
}

function releaseYoutubeFocus() {
  // Samsung and other TV browsers leave the iframe focused. YouTube then
  // treats the player as active and keeps the center pause icon up. Desktop
  // drops that icon once the pointer goes idle.
  if (!hasHardwareVideoPlane()) return
  const iframe = player?.getIframe?.()
  if (!iframe) return
  iframe.tabIndex = -1
  iframe.style.pointerEvents = 'none'
  if (document.activeElement !== iframe) return
  iframe.blur()
  const channel = document.querySelector<HTMLButtonElement>(
    '.player-controls:not([inert]) [aria-label="Next channel"]',
  )
  const wake = document.querySelector<HTMLButtonElement>('[aria-label="Show player controls"]')
  const page = document.querySelector<HTMLElement>('main.page')
  ;(channel ?? wake ?? page)?.focus({ preventScroll: true })
}

function onFocusIn(event: FocusEvent) {
  const iframe = player?.getIframe?.()
  if (iframe && event.target === iframe) releaseYoutubeFocus()
}

function createPlayer() {
  if (!host.value || !window.YT?.Player || destroyed) return
  player = new window.YT.Player(host.value, {
    width: '100%',
    height: '100%',
    videoId: props.videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
      start: Math.floor(props.startSeconds),
      origin: window.location.origin,
      // Legacy TV player builds still hide the control bar with this.
      // Current desktop players ignore it.
      ...(hasHardwareVideoPlane() ? { autohide: 1 } : {}),
    },
    events: {
      onReady: () => {
        applySound()
        disableCaptions()
        releaseYoutubeFocus()
      },
      onApiChange: disableCaptions,
      onStateChange: (event: { data: number }) => {
        if (destroyed) return
        // Caption tracks can finish loading after onApiChange during startup.
        // Reapply once playback begins, including after each channel change.
        if (event.data === window.YT?.PlayerState.PLAYING) {
          disableCaptions()
          releaseYoutubeFocus()
          emit('playing', props.videoId)
        }
        if (event.data === window.YT?.PlayerState.ENDED) emit('ended')
      },
      onError: (event: { data: number }) => {
        if (!destroyed) emit('error', event.data, props.videoId)
      },
    },
  }) as YtPlayer
}

function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-yt-iframe]')
    if (existing) {
      window.onYouTubeIframeAPIReady = () => resolve()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.dataset.ytIframe = 'true'
    tag.onerror = () => reject(new Error('iframe api'))
    window.onYouTubeIframeAPIReady = () => resolve()
    document.head.appendChild(tag)
  })
}

onMounted(async () => {
  document.addEventListener('focusin', onFocusIn)
  try {
    await loadApi()
    createPlayer()
  } catch {
    if (!destroyed) emit('script-error')
  }
})

watch(
  () => [props.videoId, props.startSeconds, props.playbackRevision] as const,
  ([videoId, startSeconds]) => {
    player?.loadVideoById({ videoId, startSeconds: Math.floor(startSeconds) })
  },
)

watch(() => [props.volume, props.muted], applySound)

onBeforeUnmount(() => {
  destroyed = true
  document.removeEventListener('focusin', onFocusIn)
  player?.destroy()
  player = null
})
</script>

<template>
  <div class="stage">
    <div ref="host" class="host" />
  </div>
</template>

<style scoped>
.stage,
.host {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stage {
  pointer-events: none;
  background: #050505;
}

.stage :deep(iframe) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  /* Hit-testing skips descendants of pointer-events: none, but TV browsers
     still deliver the remote to a focused iframe. Keep the iframe itself out. */
  pointer-events: none;
}
</style>
