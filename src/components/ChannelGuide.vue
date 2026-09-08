<script setup lang="ts">
import { computed, ref } from 'vue'
import { CHANNELS, formatChannelNumber } from '../data/channels'

defineProps<{ currentChannel: number }>()
const emit = defineEmits<{ tune: [number: number] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const search = ref('')
const tag = ref('')
const tags = [...new Set(CHANNELS.flatMap((channel) => channel.tags))].sort()
const matches = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return CHANNELS.filter(
    (channel) =>
      (!tag.value || channel.tags.includes(tag.value)) &&
      [formatChannelNumber(channel.number), channel.name, channel.blurb, ...channel.tags]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
  )
})
function tune(number: number) {
  emit('tune', number)
  dialog.value?.close()
}
</script>

<template>
  <button type="button" class="guide-launch" @click="dialog?.showModal()">Guide</button>
  <dialog ref="dialog" class="guide" aria-labelledby="guide-title" @keydown.stop>
    <header>
      <div>
        <p class="eyebrow">POSITIVE PLAYER / CHANNEL DIRECTORY</p>
        <h1 id="guide-title">Channel guide</h1>
      </div>
      <button type="button" aria-label="Close channel guide" @click="dialog?.close()">
        Close ×
      </button>
    </header>
    <div class="filters">
      <label
        >Find a channel<input
          v-model="search"
          type="search"
          placeholder="Name, number, or tag"
          autofocus
      /></label>
      <label
        >Filter by tag<select v-model="tag">
          <option value="">All tags</option>
          <option v-for="item in tags" :key="item">{{ item }}</option>
        </select></label
      >
    </div>
    <p class="count" role="status">{{ matches.length }} channels · Select to tune in</p>
    <div class="channels">
      <button
        v-for="channel in matches"
        :key="channel.number"
        type="button"
        class="channel"
        :data-channel="channel.number"
        :aria-current="channel.number === currentChannel ? 'true' : undefined"
        @click="tune(channel.number)"
      >
        <span class="number">{{ formatChannelNumber(channel.number) }}</span>
        <span class="details"
          ><span class="name"
            >{{ channel.name }}
            <small v-if="channel.number === currentChannel">TUNED IN</small></span
          >
          <span class="blurb">{{ channel.blurb }}</span>
          <span class="tags"
            ><span v-for="item in channel.tags" :key="item">{{ item }}</span></span
          >
        </span>
        <span aria-hidden="true" class="arrow">↗</span>
      </button>
      <p v-if="!matches.length" class="empty">
        No channels found. Try another search or choose All tags.
      </p>
    </div>
  </dialog>
</template>

<style scoped>
.guide-launch {
  position: absolute;
  bottom: 1.2rem;
  left: 1.3rem;
  z-index: 4;
}
button,
input,
select {
  font: inherit;
  color: inherit;
}
button {
  cursor: pointer;
}
.guide-launch,
header button {
  background: #101a13;
  color: var(--crt-phosphor);
  border: 1px solid #42634b;
  padding: 0.6rem 0.85rem;
}
.guide {
  color: #c9dfca;
  background: #0c140f;
  border: 1px solid #42634b;
  padding: clamp(1rem, 3vw, 2rem);
  width: min(48rem, calc(100vw - 2rem));
  max-height: 85dvh;
  box-sizing: border-box;
}
.guide::backdrop {
  background: rgb(0 0 0 / 75%);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
h1 {
  margin: 0.4rem 0 1.4rem;
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  color: var(--crt-phosphor);
}
.eyebrow,
.count {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: #9db6a3;
}
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.8rem;
}
label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.75rem;
}
input,
select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: #16231a;
  border: 1px solid #42634b;
  padding: 0.75rem;
}
.count {
  margin: 1.2rem 0 0.6rem;
}
.channel {
  display: flex;
  width: 100%;
  text-align: left;
  gap: 1rem;
  padding: 1rem 0.4rem;
  border: 0;
  border-top: 1px solid #2b4031;
  background: transparent;
}
.channel:hover,
.channel[aria-current] {
  background: #17291d;
}
.number {
  color: var(--crt-phosphor);
  font-size: 0.9rem;
  padding-top: 0.15rem;
}
.details {
  flex: 1;
  display: grid;
  gap: 0.5rem;
}
.name {
  color: #e0eee1;
}
small {
  font-size: 0.6rem;
  color: var(--crt-phosphor);
  margin-left: 0.5rem;
}
.blurb {
  font-size: 0.75rem;
  color: #a8bcad;
  line-height: 1.5;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tags span {
  border: 1px solid #3b5542;
  padding: 0.2rem 0.4rem;
  font-size: 0.6rem;
}
.arrow {
  color: var(--crt-phosphor);
}
.empty {
  line-height: 1.6;
  padding: 2rem 0;
}
:focus-visible {
  outline: 2px solid var(--crt-phosphor);
  outline-offset: 3px;
}
@media (max-width: 480px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .eyebrow {
    max-width: 12rem;
    line-height: 1.6;
  }
}
</style>
