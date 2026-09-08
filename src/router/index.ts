import { createRouter, createWebHistory } from 'vue-router'
import PlayerPage from '../views/PlayerPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'player', component: PlayerPage },
    { path: '/remote', name: 'remote', component: () => import('../views/RemotePage.vue') },
  ],
})

export default router
