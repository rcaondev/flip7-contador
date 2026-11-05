<script setup>
import { computed } from 'vue'
import { state, ranking } from '../store'
defineEmits(['new', 'continue', 'history'])
const leader = computed(() => (state.current ? ranking(state.current)[0] : null))
</script>

<template>
  <div class="safe-top safe-bottom flex min-h-full flex-col px-6">
    <div class="flex flex-1 flex-col items-center justify-center text-center">
      <!-- logo: três cartas em leque -->
      <div class="relative mb-8 h-36 w-40">
        <div class="absolute left-4 top-3 h-28 w-20 -rotate-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 shadow-xl ring-4 ring-white/20" />
        <div class="absolute right-4 top-3 h-28 w-20 rotate-12 rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-600 shadow-xl ring-4 ring-white/20" />
        <div class="floaty absolute left-1/2 top-0 flex h-32 w-22 -translate-x-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 text-6xl font-black shadow-2xl ring-4 ring-white/30">7</div>
      </div>
      <h1 class="text-5xl font-black tracking-tight"><span class="shine">Placar</span> Flip 7</h1>
      <p class="mt-3 text-white/60">Chega de caderno. Bora jogar!</p>
    </div>

    <div class="space-y-3 pb-4">
      <button v-if="state.current" class="btn btn-gold w-full flex-col !gap-0 !py-3" @click="$emit('continue')">
        <span>▶ Continuar partida</span>
        <span class="text-sm font-semibold opacity-75">
          Rodada {{ state.current.rounds.length + 1 }} · {{ state.current.players.length }} jogadores
          <template v-if="leader && state.current.rounds.length"> · 👑 {{ leader.name }}</template>
        </span>
      </button>
      <button class="btn w-full" :class="state.current ? 'btn-ghost' : 'btn-primary'" @click="$emit('new')">✨ Nova partida</button>
      <button class="btn btn-ghost w-full" @click="$emit('history')">
        🏆 Histórico e ranking
        <span v-if="state.history.length" class="rounded-full bg-white/15 px-2 text-sm">{{ state.history.length }}</span>
      </button>
    </div>

    <footer class="pb-1 pt-2 text-center text-sm text-white/40">
      Desenvolvido por <span class="font-semibold text-white/70">Rodrigo Caon</span><br />
      <a href="https://rodrigocaon.com.br" target="_blank" rel="noopener" class="font-semibold text-pink-300 underline-offset-2 active:underline">rodrigocaon.com.br</a>
    </footer>
  </div>
</template>
