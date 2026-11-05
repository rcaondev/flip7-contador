<script setup>
defineProps({ title: String, text: String, ok: { type: String, default: 'Confirmar' }, danger: Boolean })
import { useBack } from '../store'
const emit = defineEmits(['ok', 'cancel'])
useBack(() => emit('cancel'))
</script>
<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6" @click.self="$emit('cancel')">
    <div class="card pop w-full max-w-sm p-6 text-center">
      <h3 class="text-xl font-bold">{{ title }}</h3>
      <p v-if="text" class="mt-2 text-white/70">{{ text }}</p>
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button class="btn btn-ghost" @click="$emit('cancel')">Cancelar</button>
        <button class="btn" :class="danger ? 'bg-rose-600 text-white' : 'btn-primary'" @click="$emit('ok')">{{ ok }}</button>
      </div>
    </div>
  </div>
</template>
