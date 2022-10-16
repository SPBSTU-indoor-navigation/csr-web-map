import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { GesturePlugin } from '@vueuse/gesture'
// import { RecycleScroller } from 'vue3-virtual-scroller'

const app = createApp(App)
app
  .use(router)
  .use(GesturePlugin)
// .component('RecycleScroller', RecycleScroller)

app.config.performance = true

app.mount('#app')
