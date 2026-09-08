<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import ChannelHud from '../components/ChannelHud.vue'
import ChannelZap from '../components/ChannelZap.vue'
import CrtShell from '../components/CrtShell.vue'
import InterruptionCard from '../components/InterruptionCard.vue'
import PowerGate from '../components/PowerGate.vue'
import RemotePairing from '../components/RemotePairing.vue'
import YoutubeStage from '../components/YoutubeStage.vue'
import { useTvStore } from '../stores/tv'

const tv = useTvStore()
let digitTicker = 0

function onKey(event: KeyboardEvent) {
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, dialog, [contenteditable="true"]')) return
  if (!tv.poweredOn) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      tv.powerOn()
    }
    return
  }

  tv.showHud()

  if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
    event.preventDefault()
    tv.channelStep(1)
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
    event.preventDefault()
    tv.channelStep(-1)
    return
  }
  if (/^[0-9]$/.test(event.key)) {
    tv.typeDigit(event.key)
    return
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    tv.volumeStep(5)
    return
  }
  if (event.key === '-' || event.key === '_') {
    event.preventDefault()
    tv.volumeStep(-5)
    return
  }
  if (event.key === 'm' || event.key === 'M') {
    tv.muteToggle()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  digitTicker = window.setInterval(() => tv.tickDigits(), 200)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.clearInterval(digitTicker)
})
</script>

<template>
  <main class="page" @mousemove="tv.showHud()">
    <CrtShell>
      <YoutubeStage
        v-if="tv.poweredOn && tv.currentSlot"
        :video-id="tv.currentSlot.videoId"
        :start-seconds="tv.currentSlot.startSeconds"
        :volume="tv.volume.volume"
        :muted="tv.volume.muted"
        @ended="tv.onPlayerEnded()"
        @error="tv.onPlayerError()"
        @script-error="tv.onScriptError()"
      />
      <ChannelZap v-if="tv.zapping" />
      <InterruptionCard
        v-if="tv.poweredOn && tv.interruption !== 'none' && !tv.zapping"
        :channel-number="tv.interruptionChannelNumber"
      />
      <ChannelHud
        v-if="tv.poweredOn"
        :label="tv.channelLabel"
        :pending-digits="tv.pendingDigits"
        :volume="tv.volume.volume"
        :muted="tv.volume.muted"
        :visible="tv.hudVisible"
        @channel-step="tv.channelStep"
        @volume-step="tv.volumeStep"
      />
      <RemotePairing />
      <PowerGate v-if="!tv.poweredOn" @power="tv.powerOn()" />
    </CrtShell>
  </main>
</template>

<style scoped>
.page {
  min-height: 100dvh;
}
</style>
