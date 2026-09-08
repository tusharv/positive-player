<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
let frame = 0

function paint() {
  const node = canvas.value
  if (!node) return
  const ctx = node.getContext('2d', { alpha: false })
  if (!ctx) return

  const width = 160
  const height = 90
  if (node.width !== width) node.width = width
  if (node.height !== height) node.height = height

  const image = ctx.createImageData(width, height)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() * 255) | 0
    data[i] = n
    data[i + 1] = n
    data[i + 2] = n
    data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  frame = window.requestAnimationFrame(paint)
}

onMounted(() => {
  if (!reduceMotion) paint()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="zap" :class="{ still: reduceMotion }" aria-hidden="true">
    <canvas ref="canvas" class="snow" />
    <div class="hold" />
  </div>
</template>

<style scoped>
.zap {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  background: #111;
}

.snow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  opacity: 0.92;
  mix-blend-mode: screen;
  filter: contrast(1.8) brightness(1.15);
}

.hold {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 50px 18px #000;
}

.still {
  animation: none;
  background: #1a1a1a;
}

.still .snow {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .zap {
    animation: none;
  }

  .snow {
    display: none;
  }
}
</style>
