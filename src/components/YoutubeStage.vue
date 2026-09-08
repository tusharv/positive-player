<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type YtPlayer = {
  loadVideoById: (opts: { videoId: string; startSeconds: number }) => void
  setVolume: (n: number) => void
  mute: () => void
  unMute: () => void
  destroy: () => void
}

const props = defineProps<{
  videoId: string
  startSeconds: number
  volume: number
  muted: boolean
}>()

const emit = defineEmits<{
  ended: []
  error: []
  'script-error': []
}>()

const host = ref<HTMLDivElement | null>(null)
let player: YtPlayer | null = null
let destroyed = false

function applySound() {
  if (!player) return
  player.setVolume(props.volume)
  if (props.muted || props.volume === 0) player.mute()
  else player.unMute()
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
    },
    events: {
      onReady: () => applySound(),
      onStateChange: (event: { data: number }) => {
        if (event.data === window.YT?.PlayerState.ENDED) emit('ended')
      },
      onError: () => emit('error'),
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
  try {
    await loadApi()
    createPlayer()
  } catch {
    emit('script-error')
  }
})

watch(
  () => [props.videoId, props.startSeconds] as const,
  ([videoId, startSeconds]) => {
    player?.loadVideoById({ videoId, startSeconds: Math.floor(startSeconds) })
  },
)

watch(() => [props.volume, props.muted], applySound)

onBeforeUnmount(() => {
  destroyed = true
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
}
</style>
