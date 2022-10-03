import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { GesturePlugin } from '@vueuse/gesture'

const app = createApp(App)
app
  .use(router)
  .use(GesturePlugin)

app.config.performance = true

app.mount('#app')
