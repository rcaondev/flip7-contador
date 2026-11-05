import { reactive, watch } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

const KEY = 'placar-flip7-v1'

export const COLORS = [
  '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
]

export const FLIP7_BONUS = 15

export const state = reactive({
  ready: false,
  current: null,   // partida em andamento
  history: [],     // partidas encerradas (mais recente primeiro)
  lastPlayers: [], // nomes da última partida, para pré-preencher
  target: 200,
})

export async function load() {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value) Object.assign(state, JSON.parse(value))
  } catch (e) {
    console.warn('Falha ao carregar dados', e)
  }
  state.ready = true
  watch(
    () => ({
      current: state.current,
      history: state.history,
      lastPlayers: state.lastPlayers,
      target: state.target,
    }),
    (v) => Preferences.set({ key: KEY, value: JSON.stringify(v) }).catch(() => {}),
    { deep: true },
  )
}

export const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------- cálculos ---------- */

export function totals(game) {
  const t = {}
  for (const p of game.players) t[p.id] = 0
  for (const r of game.rounds) for (const id in r.scores) t[id] = (t[id] || 0) + (r.scores[id] || 0)
  return t
}

export function ranking(game) {
  const t = totals(game)
  const last = game.rounds[game.rounds.length - 1]
  return game.players
    .map((p) => ({ ...p, total: t[p.id], last: last ? last.scores[p.id] ?? 0 : null }))
    .sort((a, b) => b.total - a.total)
}

/** 'win' quando alguém passou da meta sozinho na liderança, 'tie' quando empatados no topo */
function evaluate(game) {
  const r = ranking(game)
  game.winnerId = null
  if (!r.length || r[0].total < game.target) return null
  if (r[1] && r[1].total === r[0].total) return 'tie'
  game.winnerId = r[0].id
  return 'win'
}

/* ---------- ações ---------- */

export function startGame(names, target) {
  state.current = {
    id: uid(),
    players: names.map((name, i) => ({ id: uid(), name, color: COLORS[i % COLORS.length] })),
    rounds: [],
    target,
    startedAt: Date.now(),
    winnerId: null,
  }
  state.lastPlayers = [...names]
  state.target = target
}

/** round = { scores: {pid: n}, bust: [pid], flip7: [pid] } */
export function saveRound(round, index = null) {
  const g = state.current
  if (index === null) g.rounds.push(round)
  else g.rounds[index] = round
  return evaluate(g)
}

export function undoRound() {
  const g = state.current
  g.rounds.pop()
  evaluate(g)
}

export function finishGame() {
  const g = state.current
  if (!g) return
  if (g.rounds.length) {
    g.finishedAt = Date.now()
    state.history.unshift(g)
  }
  state.current = null
}

export function deleteHistory(id) {
  state.history = state.history.filter((g) => g.id !== id)
}

export function playerStats() {
  const by = {}
  for (const g of state.history) {
    for (const p of g.players) {
      const key = p.name.trim().toLowerCase()
      const s = (by[key] ||= { name: p.name, games: 0, wins: 0, rounds: 0, points: 0, best: 0, flip7: 0, busts: 0 })
      s.games++
      if (g.winnerId === p.id) s.wins++
      for (const r of g.rounds) {
        const v = r.scores[p.id] ?? 0
        s.rounds++
        s.points += v
        s.best = Math.max(s.best, v)
        if (r.flip7?.includes(p.id)) s.flip7++
        if (r.bust?.includes(p.id)) s.busts++
      }
    }
  }
  return Object.values(by).sort((a, b) => b.wins - a.wins || b.games - a.games)
}

/* ---------- vibração ---------- */

export const haptic = {
  tap: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  ok: () => Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
  warn: () => Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),
}

/* ---------- botão voltar do Android ---------- */
// Modais registram aqui como fechar; o App chama o mais recente antes de navegar.
import { onMounted, onBeforeUnmount } from 'vue'
export const backHandlers = []
export function useBack(fn) {
  onMounted(() => backHandlers.push(fn))
  onBeforeUnmount(() => {
    const i = backHandlers.lastIndexOf(fn)
    if (i >= 0) backHandlers.splice(i, 1)
  })
}
