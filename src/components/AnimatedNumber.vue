<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ value: { type: Number, default: 0 } })
const shown = ref(props.value)
let raf
watch(() => props.value, (to) => {
  cancelAnimationFrame(raf)
  const from = shown.value, start = performance.now(), dur = 700
  const step = (t) => {
    const k = Math.min(1, (t - start) / dur)
    shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})
</script>
<template><span class="tabular-nums">{{ shown }}</span></template>
