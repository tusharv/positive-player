import { createRouter, createWebHistory } from 'vue-router'
import PlayerPage from '../views/PlayerPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'player', component: PlayerPage },
    { path: '/remote', name: 'remote', component: () => import('../views/RemotePage.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyPage.vue') },
    { path: '/terms', name: 'terms', component: () => import('../views/TermsPage.vue') },
  ],
})

export default router
