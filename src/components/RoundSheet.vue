<script setup>
import { reactive, computed } from 'vue'
import { FLIP7_BONUS, haptic, useBack } from '../store'

const props = defineProps({
  players: Array,
  initial: Object, // rodada existente quando editando
  number: Number,
})
const emit = defineEmits(['save', 'close'])
useBack(() => emit('close'))

const rows = reactive(
  Object.fromEntries(
    props.players.map((p) => {
      const bust = props.initial?.bust?.includes(p.id) ?? false
      const flip7 = props.initial?.flip7?.includes(p.id) ?? false
      const score = props.initial?.scores[p.id]
      const base = score == null || bust ? '' : score - (flip7 ? FLIP7_BONUS : 0)
      return [p.id, { value: base, bust, flip7 }]
    }),
  ),
)

const scoreOf = (r) => (r.bust ? 0 : (Number(r.value) || 0) + (r.flip7 ? FLIP7_BONUS : 0))
const filled = computed(() => props.players.filter((p) => rows[p.id].bust || rows[p.id].flip7 || rows[p.id].value !== '').length)

function toggleBust(r) { r.bust = !r.bust; if (r.bust) r.flip7 = false; haptic.tap() }
function toggleFlip7(r) { r.flip7 = !r.flip7; if (r.flip7) r.bust = false; haptic.tap() }

function save() {
  const round = { scores: {}, bust: [], flip7: [] }
  for (const p of props.players) {
    const r = rows[p.id]
    round.scores[p.id] = scoreOf(r)
    if (r.bust) round.bust.push(p.id)
    if (r.flip7) round.flip7.push(p.id)
  }
  emit('save', round)
}
</script>

<template>
  <div class="fixed inset-0 z-30 flex flex-col justify-end">
    <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />
    <div class="safe-bottom relative flex max-h-[92%] flex-col rounded-t-[2rem] bg-panel ring-1 ring-white/10">
      <div class="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />
      <header class="flex items-center justify-between px-5 pb-3 pt-3">
        <div>
          <h3 class="text-2xl font-black">{{ initial ? 'Editar' : 'Lançar' }} rodada {{ number }}</h3>
          <p class="text-sm text-white/50">{{ filled }}/{{ players.length }} preenchidos · vazio conta 0</p>
        </div>
        <button class="h-10 w-10 rounded-full bg-white/10" @click="$emit('close')">✕</button>
      </header>

      <div class="flex-1 space-y-2.5 overflow-y-auto px-4 pb-3">
        <div v-for="p in players" :key="p.id" class="rounded-2xl bg-white/5 p-3 transition"
          :class="{ 'bg-rose-500/15 ring-1 ring-rose-400/40': rows[p.id].bust, 'bg-amber-400/15 ring-1 ring-amber-300/50': rows[p.id].flip7 }">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black" :style="{ background: p.color }">
              {{ p.name[0].toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1 truncate text-lg font-semibold">{{ p.name }}</span>
            <input v-model="rows[p.id].value" type="number" inputmode="numeric" placeholder="0" :disabled="rows[p.id].bust"
              class="w-24 rounded-xl bg-ink/60 px-3 py-2.5 text-right text-2xl font-black outline-none ring-pink-400 placeholder:text-white/20 focus:ring-2 disabled:opacity-30" />
          </div>
          <div class="mt-2.5 flex items-center gap-2 pl-14">
            <button class="rounded-full px-3 py-1.5 text-sm font-bold transition"
              :class="rows[p.id].bust ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/70'" @click="toggleBust(rows[p.id])">💥 Estourou</button>
            <button class="rounded-full px-3 py-1.5 text-sm font-bold transition"
              :class="rows[p.id].flip7 ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-white/70'" @click="toggleFlip7(rows[p.id])">⭐ Flip 7 +{{ FLIP7_BONUS }}</button>
            <span class="ml-auto text-lg font-black tabular-nums" :class="scoreOf(rows[p.id]) ? 'text-emerald-300' : 'text-white/30'">
              +{{ scoreOf(rows[p.id]) }}
            </span>
          </div>
        </div>
      </div>

      <div class="px-4 pt-2">
        <button class="btn btn-gold w-full" @click="save">✅ Salvar rodada</button>
      </div>
    </div>
  </div>
</template>
