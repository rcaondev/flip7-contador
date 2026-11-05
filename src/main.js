import { createApp } from 'vue'
import '@fontsource-variable/fredoka'
import './style.css'
import App from './App.vue'
import { load } from './store'

load().then(() => createApp(App).mount('#app'))
