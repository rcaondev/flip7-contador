<script setup>
import { ref, computed, nextTick } from 'vue'
import { state, startGame, COLORS, haptic } from '../store'
const emit = defineEmits(['back', 'start'])

const names = ref([...state.lastPlayers])
const draft = ref('')
const target = ref(state.target || 200)
const custom = ref(![100, 200, 300].includes(target.value))
const input = ref(null)

const dup = computed(() => names.value.some((n) => n.toLowerCase() === draft.value.trim().toLowerCase()))

function add() {
  const n = draft.value.trim()
  if (!n || dup.value) return
  names.value.push(n)
  draft.value = ''
  haptic.tap()
  nextTick(() => input.value?.focus())
}
function remove(i) { names.value.splice(i, 1); haptic.tap() }
function go() {
  if (draft.value.trim()) add()
  if (names.value.length < 2) return
  startGame(names.value, Math.max(10, Number(target.value) || 200))
  haptic.ok()
  emit('start')
}
</script>

<template>
  <div class="safe-top safe-bottom flex min-h-full flex-col px-5">
    <header class="flex items-center gap-3 pb-4">
      <button class="btn btn-ghost !px-4 !py-2" @click="$emit('back')">←</button>
      <h2 class="text-2xl font-bold">Nova partida</h2>
    </header>

    <section class="card p-5">
      <h3 class="mb-3 font-bold text-white/70">🎯 Meta de pontos</h3>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="t in [100, 200, 300]" :key="t"
          class="rounded-xl py-2.5 font-bold transition"
          :class="!custom && target === t ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/10'"
          @click="target = t; custom = false">{{ t }}</button>
        <button class="rounded-xl py-2.5 font-bold transition" :class="custom ? 'bg-pink-500' : 'bg-white/10'" @click="custom = true">Outra</button>
      </div>
      <input v-if="custom" v-model.number="target" type="number" inputmode="numeric"
        class="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-lg font-bold outline-none ring-pink-400 focus:ring-2" />
    </section>

    <section class="card mt-4 flex-1 p-5">
      <h3 class="mb-3 font-bold text-white/70">🧑‍🤝‍🧑 Jogadores <span class="text-white/40">({{ names.length }})</span></h3>
      <form class="flex gap-2" @submit.prevent="add">
        <input ref="input" v-model="draft" maxlength="16" placeholder="Nome do jogador" enterkeyhint="done"
          class="min-w-0 flex-1 rounded-xl bg-white/10 px-4 py-3 text-lg outline-none ring-pink-400 placeholder:text-white/30 focus:ring-2" />
        <button class="btn btn-primary !px-5 !py-2" :disabled="!draft.trim() || dup">+</button>
      </form>
      <p v-if="dup" class="mt-2 text-sm text-rose-300">Esse nome já está na lista.</p>

      <TransitionGroup name="list" tag="ul" class="relative mt-4 space-y-2">
        <li v-for="(n, i) in names" :key="n" class="flex items-center gap-3 rounded-2xl bg-white/5 p-2 pr-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black"
            :style="{ background: COLORS[i % COLORS.length] }">{{ n[0].toUpperCase() }}</span>
          <span class="flex-1 truncate text-lg font-semibold">{{ n }}</span>
          <button class="h-9 w-9 rounded-full bg-white/10 text-white/60 active:bg-rose-500" @click="remove(i)">✕</button>
        </li>
      </TransitionGroup>
      <p v-if="!names.length" class="mt-6 text-center text-white/40">Adicione pelo menos 2 jogadores</p>
    </section>

    <button class="btn btn-gold mt-4 w-full" :disabled="names.length + (draft.trim() && !dup ? 1 : 0) < 2" @click="go">
      🚀 Começar partida
    </button>
  </div>
</template>
