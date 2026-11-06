<script setup>
import { ref, computed } from 'vue'
import { state, ranking, playerStats, deleteHistory } from '../store'
import ConfirmModal from './ConfirmModal.vue'
import RoundsTable from './RoundsTable.vue'
defineEmits(['back'])

const tab = ref('ranking')
const stats = computed(() => playerStats())
const games = computed(() => state.history.map((g) => ({ g, r: ranking(g) })))
const open = ref(null)
const toDelete = ref(null)

const fmt = (ts) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const medal = (i) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}º`
function remove() { deleteHistory(toDelete.value); toDelete.value = null }
</script>

<template>
  <div class="safe-top safe-bottom flex h-full flex-col px-5">
    <header class="flex items-center gap-3 pb-4">
      <button class="btn btn-ghost !px-4 !py-2" @click="$emit('back')">←</button>
      <h2 class="text-2xl font-bold">Histórico</h2>
    </header>

    <div class="mb-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1 text-sm font-bold">
      <button class="rounded-xl py-2 transition" :class="tab === 'ranking' ? 'bg-white/15' : 'text-white/50'" @click="tab = 'ranking'">🏆 Ranking</button>
      <button class="rounded-xl py-2 transition" :class="tab === 'partidas' ? 'bg-white/15' : 'text-white/50'" @click="tab = 'partidas'">📜 Partidas</button>
    </div>

    <div class="flex-1 overflow-y-auto pb-4">
      <p v-if="!state.history.length" class="card p-8 text-center text-white/40">Termine uma partida para ela aparecer aqui.</p>

      <ol v-else-if="tab === 'ranking'" class="space-y-3">
        <li v-for="(s, i) in stats" :key="s.name" class="card p-4">
          <div class="flex items-center gap-3">
            <span class="w-8 text-center text-2xl font-black">{{ medal(i) }}</span>
            <span class="flex-1 truncate text-lg font-bold">{{ s.name }}</span>
            <span class="text-right">
              <span class="text-3xl font-black">{{ s.wins }}</span>
              <span class="text-sm text-white/50"> vitória{{ s.wins === 1 ? '' : 's' }}</span>
            </span>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-white/50">
            <div class="rounded-xl bg-white/5 py-2"><b class="block text-base text-white">{{ s.games }}</b>partidas</div>
            <div class="rounded-xl bg-white/5 py-2"><b class="block text-base text-white">{{ s.rounds ? Math.round(s.points / s.rounds) : 0 }}</b>média</div>
            <div class="rounded-xl bg-white/5 py-2"><b class="block text-base text-amber-300">{{ s.flip7 }}</b>flip 7</div>
            <div class="rounded-xl bg-white/5 py-2"><b class="block text-base text-rose-300">{{ s.busts }}</b>estouros</div>
          </div>
        </li>
      </ol>

      <ul v-else class="space-y-3">
        <li v-for="{ g, r } in games" :key="g.id" class="card p-4" @click="open = open === g.id ? null : g.id">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-bold">{{ g.winnerId ? `🏆 ${r[0].name}` : '🏁 Sem vencedor' }}</div>
              <div class="text-sm text-white/50">{{ fmt(g.finishedAt) }} · {{ g.rounds.length }} rodadas · meta {{ g.target }}</div>
            </div>
            <span class="text-white/40">{{ open === g.id ? '▲' : '▼' }}</span>
          </div>
          <div v-if="open === g.id" class="mt-3 space-y-1.5" @click.stop>
            <div v-for="(p, i) in r" :key="p.id" class="flex justify-between rounded-xl bg-white/5 px-3 py-1.5">
              <span>{{ medal(i) }} {{ p.name }}</span><span class="font-black tabular-nums">{{ p.total }}</span>
            </div>
            <div class="pt-3 text-xs font-bold uppercase tracking-widest text-white/40">Rodada a rodada</div>
            <RoundsTable :game="g" class="-mx-1 rounded-xl bg-white/5 p-1 text-sm" />
            <button class="mt-2 w-full py-2 text-sm text-rose-300" @click.stop="toDelete = g.id">🗑️ Apagar partida</button>
          </div>
        </li>
      </ul>
    </div>

    <ConfirmModal v-if="toDelete" title="Apagar partida?" text="Ela sai do histórico e do ranking." ok="Apagar" danger
      @ok="remove" @cancel="toDelete = null" />
  </div>
</template>
