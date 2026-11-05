<script setup>
import { ref, computed } from 'vue'
import { state, ranking, saveRound, undoRound, finishGame, startGame, haptic, FLIP7_BONUS } from '../store'
import AnimatedNumber from './AnimatedNumber.vue'
import RoundSheet from './RoundSheet.vue'
import ConfirmModal from './ConfirmModal.vue'
import Confetti from './Confetti.vue'

const emit = defineEmits(['home'])
const game = computed(() => state.current)
const ranked = computed(() => ranking(game.value))
const winner = computed(() => game.value.players.find((p) => p.id === game.value.winnerId))
const nameOf = (id) => game.value.players.find((p) => p.id === id)

const sheet = ref(null) // { index: number|null }
const confirm = ref(null) // 'undo' | 'end'
const toast = ref('')
const tab = ref('placar')
let toastTimer

function flash(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

function onSave(round) {
  const result = saveRound(round, sheet.value.index)
  sheet.value = null
  if (result === 'win') haptic.ok()
  else if (result === 'tie') { haptic.warn(); flash('🤝 Empate no topo! Mais uma rodada pra desempatar') }
  else {
    haptic.tap()
    if (round.flip7.length) flash(`⭐ Flip 7 de ${round.flip7.map((id) => nameOf(id).name).join(', ')}!`)
  }
}

function doUndo() { undoRound(); confirm.value = null; flash('↩️ Última rodada desfeita') }
function doEnd() { confirm.value = null; finishGame(); emit('home') }
function rematch() {
  const names = game.value.players.map((p) => p.name), target = game.value.target
  finishGame()
  startGame(names, target)
}
function goHome() { finishGame(); emit('home') }

const medal = (i) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}º`
const pct = (t) => Math.min(100, Math.max(0, (t / game.value.target) * 100))
</script>

<template>
  <div v-if="game" class="safe-top flex h-full flex-col">
    <!-- topo -->
    <header class="flex items-center gap-3 px-5 pb-3">
      <button class="btn btn-ghost !px-4 !py-2" @click="$emit('home')">←</button>
      <div class="flex-1">
        <div class="text-xs font-bold uppercase tracking-widest text-white/40">Rodada</div>
        <div class="text-2xl font-black leading-none">{{ game.rounds.length + (winner ? 0 : 1) }}</div>
      </div>
      <div class="rounded-2xl bg-white/10 px-3 py-1.5 text-right">
        <div class="text-xs font-bold uppercase tracking-widest text-white/40">Meta</div>
        <div class="font-black leading-none">🎯 {{ game.target }}</div>
      </div>
      <button class="btn btn-ghost !px-4 !py-2" title="Encerrar" @click="confirm = 'end'">🏁</button>
    </header>

    <!-- abas -->
    <div class="mx-5 mb-3 grid grid-cols-2 rounded-2xl bg-white/5 p-1 text-sm font-bold">
      <button v-for="t in ['placar', 'rodadas']" :key="t" class="rounded-xl py-2 capitalize transition"
        :class="tab === t ? 'bg-white/15 text-white' : 'text-white/50'" @click="tab = t">{{ t }}</button>
    </div>

    <main class="flex-1 overflow-y-auto px-5 pb-36">
      <!-- placar -->
      <TransitionGroup v-if="tab === 'placar'" name="list" tag="ol" class="relative space-y-3">
        <li v-for="(p, i) in ranked" :key="p.id" class="card relative overflow-hidden p-4"
          :class="i === 0 && p.total > 0 ? 'ring-2 ring-amber-300/70 shadow-lg shadow-amber-400/20' : ''">
          <div class="flex items-center gap-3">
            <span class="w-8 text-center text-2xl font-black">{{ medal(i) }}</span>
            <span class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black" :style="{ background: p.color }">
              {{ p.name[0].toUpperCase() }}
              <span v-if="i === 0 && p.total > 0" class="floaty absolute -top-4 text-xl">👑</span>
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-lg font-bold">{{ p.name }}</div>
              <div class="text-sm text-white/50">faltam {{ Math.max(0, game.target - p.total) }}</div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-black"><AnimatedNumber :value="p.total" /></div>
              <div v-if="p.last !== null" :key="game.rounds.length" class="pop text-sm font-bold"
                :class="p.last ? 'text-emerald-300' : 'text-rose-300'">{{ p.last ? `+${p.last}` : '💥 0' }}</div>
            </div>
          </div>
          <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full transition-all duration-700" :style="{ width: pct(p.total) + '%', background: p.color }" />
          </div>
        </li>
      </TransitionGroup>

      <!-- tabela de rodadas -->
      <div v-else class="card overflow-x-auto p-3">
        <p v-if="!game.rounds.length" class="p-6 text-center text-white/40">Nenhuma rodada ainda</p>
        <table v-else class="w-full text-center tabular-nums">
          <thead>
            <tr class="text-sm text-white/50">
              <th class="p-2 text-left">#</th>
              <th v-for="p in game.players" :key="p.id" class="p-2">
                <span class="inline-block h-3 w-3 rounded-full align-middle" :style="{ background: p.color }" />
                <div class="max-w-16 truncate">{{ p.name }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in game.rounds" :key="i" class="border-t border-white/5 active:bg-white/10" @click="sheet = { index: i }">
              <td class="p-2 text-left text-white/40">{{ i + 1 }} ✏️</td>
              <td v-for="p in game.players" :key="p.id" class="p-2 font-bold"
                :class="r.bust?.includes(p.id) ? 'text-rose-300' : r.flip7?.includes(p.id) ? 'text-amber-300' : ''">
                {{ r.bust?.includes(p.id) ? '💥' : r.scores[p.id] }}{{ r.flip7?.includes(p.id) ? '⭐' : '' }}
              </td>
            </tr>
            <tr class="border-t-2 border-white/20 text-lg">
              <td class="p-2 text-left font-black">Σ</td>
              <td v-for="p in game.players" :key="p.id" class="p-2 font-black">{{ ranked.find((x) => x.id === p.id).total }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="game.rounds.length" class="px-2 pt-2 text-xs text-white/40">Toque numa rodada para corrigir · ⭐ inclui +{{ FLIP7_BONUS }}</p>
      </div>
    </main>

    <!-- ações -->
    <div class="safe-bottom fixed inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-ink via-ink/95 to-transparent px-5 pt-8">
      <button class="btn btn-ghost !px-5" :disabled="!game.rounds.length" @click="confirm = 'undo'">↩️</button>
      <button class="btn btn-primary flex-1 text-xl" @click="sheet = { index: null }">➕ Nova rodada</button>
    </div>

    <Transition name="fade">
      <div v-if="toast" class="pop fixed inset-x-5 top-24 z-40 rounded-2xl bg-white px-4 py-3 text-center font-bold text-ink shadow-2xl">{{ toast }}</div>
    </Transition>

    <Transition name="sheet">
      <RoundSheet v-if="sheet" :players="game.players" :initial="sheet.index !== null ? game.rounds[sheet.index] : null"
        :number="sheet.index !== null ? sheet.index + 1 : game.rounds.length + 1" @save="onSave" @close="sheet = null" />
    </Transition>

    <ConfirmModal v-if="confirm === 'undo'" title="Desfazer última rodada?" :text="`A rodada ${game.rounds.length} será apagada.`"
      ok="Desfazer" danger @ok="doUndo" @cancel="confirm = null" />
    <ConfirmModal v-if="confirm === 'end'" title="Encerrar partida?"
      :text="game.rounds.length ? 'Ela vai para o histórico sem vencedor.' : 'Nenhuma rodada foi jogada, nada será salvo.'"
      ok="Encerrar" danger @ok="doEnd" @cancel="confirm = null" />

    <!-- vitória -->
    <Transition name="fade">
      <div v-if="winner" class="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/90 p-6 text-center backdrop-blur">
        <Confetti />
        <div class="pop text-7xl">🏆</div>
        <p class="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-white/50">Vitória!</p>
        <h2 class="shine mt-1 text-5xl font-black">{{ winner.name }}</h2>
        <p class="mt-2 text-xl font-bold">{{ ranked[0].total }} pontos em {{ game.rounds.length }} rodadas</p>
        <ol class="mt-6 w-full max-w-xs space-y-1.5">
          <li v-for="(p, i) in ranked" :key="p.id" class="flex justify-between rounded-xl bg-white/5 px-4 py-2">
            <span>{{ medal(i) }} {{ p.name }}</span><span class="font-black tabular-nums">{{ p.total }}</span>
          </li>
        </ol>
        <div class="mt-8 w-full max-w-xs space-y-3">
          <button class="btn btn-gold w-full" @click="rematch">🔁 Revanche</button>
          <button class="btn btn-ghost w-full" @click="goHome">🏠 Início</button>
          <button class="w-full py-2 text-sm text-white/50 underline" @click="doUndo">Lancei errado, desfazer rodada</button>
        </div>
      </div>
    </Transition>
  </div>
</template>
