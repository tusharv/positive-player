<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0
let running = false
let context: CanvasRenderingContext2D | null = null

function paint() {
  const el = canvas.value
  const ctx = context
  if (!el || !ctx) return
  const { width, height } = el
  if (width < 1 || height < 1) return
  try {
    const image = ctx.createImageData(width, height)
    const pixels = image.data
    for (let i = 0; i < pixels.length; i += 4) {
      const value = 40 + Math.random() * 190
      pixels[i] = value
      pixels[i + 1] = value
      pixels[i + 2] = value
      pixels[i + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
  } catch {
    running = false
  }
}

function resize() {
  const el = canvas.value
  if (!el) return
  const scale = 4
  const width = Math.max(1, Math.floor(el.clientWidth / scale))
  const height = Math.max(1, Math.floor(el.clientHeight / scale))
  if (el.width !== width) el.width = width
  if (el.height !== height) el.height = height
  paint()
}

function loop() {
  if (!running) return
  paint()
  frame = requestAnimationFrame(loop)
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  try {
    context = el.getContext('2d', { alpha: false })
  } catch {
    return
  }
  if (!context) return
  resize()
  running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (running) frame = requestAnimationFrame(loop)
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', resize)
  context = null
})
</script>

<template>
  <canvas ref="canvas" class="snow" data-testid="analog-snow" aria-hidden="true" />
</template>

<style scoped>
.snow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  pointer-events: none;
}
</style>
