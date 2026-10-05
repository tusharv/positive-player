<script setup lang="ts">
defineProps<{
  name:
    | 'channel-down'
    | 'channel-up'
    | 'channels'
    | 'volume-down'
    | 'volume-up'
    | 'mute'
    | 'sound'
    | 'fullscreen'
    | 'restore'
    | 'remote'
    | 'share'
}>()
</script>

<template>
  <svg
    class="watch-icon"
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="square"
    stroke-linejoin="miter"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'channel-down' || name === 'channel-up'">
      <path d="M4 8h24v18H4zM10 3l6 5 6-5M23 12h1m-1 4h1M22 21h3" />
      <path :d="name === 'channel-up' ? 'M8 19l5-5 5 5' : 'M8 15l5 5 5-5'" />
    </template>
    <template v-else-if="name === 'channels'">
      <path d="M3 7h26v20H3zM9 3l7 4 7-4M7 11h14v12H7zM25 12v1m0 4v1m0 4v1M8 17h12M14 12v10" />
    </template>
    <template
      v-else-if="
        name === 'volume-down' || name === 'volume-up' || name === 'mute' || name === 'sound'
      "
    >
      <path d="M4 13h5l7-6v20l-7-6H4z" />
      <path v-if="name === 'mute'" d="m22 13 7 8m0-8-7 8" />
      <path v-else-if="name === 'sound'" d="M21 12v10m5-14v18" />
      <template v-else>
        <path d="M21 16h8M5 27h2m3 0h2" />
        <path v-if="name === 'volume-up'" d="M25 12v8M21 27h2m3 0h2" />
      </template>
    </template>
    <template v-else-if="name === 'fullscreen' || name === 'restore'">
      <path d="M3 6h26v21H3z" opacity=".45" />
      <path v-if="name === 'fullscreen'" d="M7 14v-4h5m8 0h5v4M7 19v4h5m8 0h5v-4" />
      <path v-else d="M12 10v5H7m13-5v5h5M7 19h5v4m8 0v-4h5" />
    </template>
    <template v-else-if="name === 'share'">
      <circle cx="24" cy="6" r="4" />
      <circle cx="8" cy="16" r="4" />
      <circle cx="24" cy="26" r="4" />
      <path d="m11.5 14 9-6m-9 10 9 6" />
    </template>
    <template v-else>
      <path
        d="M10 9h12v20H10zM14 13h4M14 18h0m4 0h0m-4 4h0m4 0h0M14 26h4M13 5q3-3 6 0M10 2q6-5 12 0"
      />
    </template>
  </svg>
</template>
