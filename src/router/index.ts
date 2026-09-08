import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: LandingPage },
    { path: '/watch', name: 'player', component: () => import('../views/PlayerPage.vue') },
    { path: '/remote', name: 'remote', component: () => import('../views/RemotePage.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyPage.vue') },
    { path: '/terms', name: 'terms', component: () => import('../views/TermsPage.vue') },
  ],
})

export default router
