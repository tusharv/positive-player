import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/tiro-devanagari-hindi/400.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/crt.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
