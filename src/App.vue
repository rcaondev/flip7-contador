<script setup>
import { ref, onMounted } from 'vue'
import { App as CapApp } from '@capacitor/app'
import { state, backHandlers } from './store'
import HomeView from './components/HomeView.vue'
import SetupView from './components/SetupView.vue'
import GameView from './components/GameView.vue'
import HistoryView from './components/HistoryView.vue'

const screen = ref(state.current ? 'game' : 'home')

onMounted(() => {
  CapApp.addListener('backButton', () => {
    if (backHandlers.length) return backHandlers[backHandlers.length - 1]()
    if (screen.value === 'home') return CapApp.minimizeApp()
    screen.value = 'home'
  }).catch(() => {})
})
</script>

<template>
  <Transition name="fade" mode="out-in">
    <HomeView v-if="screen === 'home'" @new="screen = 'setup'" @continue="screen = 'game'" @history="screen = 'history'" />
    <SetupView v-else-if="screen === 'setup'" @back="screen = 'home'" @start="screen = 'game'" />
    <GameView v-else-if="screen === 'game' && state.current" @home="screen = 'home'" />
    <HistoryView v-else-if="screen === 'history'" @back="screen = 'home'" />
    <HomeView v-else @new="screen = 'setup'" @continue="screen = 'game'" @history="screen = 'history'" />
  </Transition>
</template>
