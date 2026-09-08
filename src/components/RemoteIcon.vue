<script setup lang="ts">
defineProps<{ name: 'power' | 'plus' | 'minus' | 'tv' | 'volume' | 'mute' }>()
</script>

<template>
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'power'"><path d="M12 3v9M6.3 5.7a9 9 0 1 0 11.4 0" /></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'minus'"><path d="M5 12h14" /></template>
    <template v-else-if="name === 'tv'">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="m8 2 4 4 4-4" />
    </template>
    <template v-else>
      <path d="m11 4-6 5H2v6h3l6 5z" />
      <path v-if="name === 'volume'" d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />
      <path v-else d="m16 9 6 6m0-6-6 6" />
    </template>
  </svg>
</template>
