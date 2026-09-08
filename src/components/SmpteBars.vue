<script setup lang="ts">
import {
  SMPTE_COLOR,
  SMPTE_MID,
  SMPTE_MID_COLORS,
  SMPTE_TOP,
  SMPTE_TOP_COLORS,
} from '../lib/smpteBars'
</script>

<template>
  <div class="smpte" aria-hidden="true">
    <div class="row" data-row="top">
      <span
        v-for="(name, index) in SMPTE_TOP"
        :key="`top-${index}`"
        :data-bar="name"
        :style="{ background: SMPTE_TOP_COLORS[index] }"
      />
    </div>
    <div class="row" data-row="mid">
      <span
        v-for="(name, index) in SMPTE_MID"
        :key="`mid-${index}`"
        :data-bar="name"
        :style="{ background: SMPTE_MID_COLORS[index] }"
      />
    </div>
    <div class="row bot" data-row="bot">
      <span data-bar="minus-i" :style="{ background: SMPTE_COLOR.minusI }" />
      <span data-bar="peak-white" :style="{ background: SMPTE_COLOR.white100 }" />
      <span data-bar="plus-q" :style="{ background: SMPTE_COLOR.plusQ }" />
      <span :style="{ background: SMPTE_COLOR.black }" />
      <span data-bar="pluge" class="pluge">
        <i :style="{ background: SMPTE_COLOR.plugeLow }" />
        <i :style="{ background: SMPTE_COLOR.plugeBlack }" />
        <i :style="{ background: SMPTE_COLOR.plugeHigh }" />
      </span>
      <span :style="{ background: SMPTE_COLOR.black }" />
    </div>
  </div>
</template>

<style scoped>
.smpte {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-rows: 67% 8% 25%;
  pointer-events: none;
}

.row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 0;
}

.bot {
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr;
}

.row span,
.pluge i {
  display: block;
  min-width: 0;
  min-height: 0;
}

.pluge {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
