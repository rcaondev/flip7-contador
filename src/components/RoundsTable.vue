<script setup>
import { computed } from 'vue'
import { totals, FLIP7_BONUS } from '../store'

const props = defineProps({
  game: { type: Object, required: true },
  editable: { type: Boolean, default: false },
})
const emit = defineEmits(['edit'])
const sum = computed(() => totals(props.game))
</script>

<template>
  <div class="overflow-x-auto">
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
        <tr v-for="(r, i) in game.rounds" :key="i" class="border-t border-white/5"
          :class="editable ? 'active:bg-white/10' : ''" @click="editable && emit('edit', i)">
          <td class="p-2 text-left text-white/40">{{ i + 1 }}<template v-if="editable"> ✏️</template></td>
          <td v-for="p in game.players" :key="p.id" class="p-2 font-bold"
            :class="r.bust?.includes(p.id) ? 'text-rose-300' : r.flip7?.includes(p.id) ? 'text-amber-300' : ''">
            {{ r.bust?.includes(p.id) ? '💥' : r.scores[p.id] ?? 0 }}{{ r.flip7?.includes(p.id) ? '⭐' : '' }}
          </td>
        </tr>
        <tr class="border-t-2 border-white/20 text-lg">
          <td class="p-2 text-left font-black">Σ</td>
          <td v-for="p in game.players" :key="p.id" class="p-2 font-black">{{ sum[p.id] }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="game.rounds.length" class="px-2 pt-2 text-xs text-white/40">
      <template v-if="editable">Toque numa rodada para corrigir · </template>⭐ inclui +{{ FLIP7_BONUS }}
    </p>
  </div>
</template>
