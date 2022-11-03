import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'

const routes = [
  {
    path: '/:mapID',
    alias: ['/:mapID/share/:shareVariant'],
    name: 'Map',
    component: Map
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
