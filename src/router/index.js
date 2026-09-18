import { createRouter, createWebHistory } from 'vue-router'
import HubView from '../views/HubView.vue'
import { useUserStore } from '@/stores/userStore.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HubView,
      meta: { fullWidth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/catalogue',
      name: 'catalogue',
      component: () => import('../views/CatalogueView.vue'),
    },
    {
      path: '/select-user',
      name: 'select-user',
      component: () => import('../views/SelectUserView.vue'),
    },
    {
      path: '/tracker',
      name: 'tracker',
      component: () => import('../views/TrackerView.vue'),
    },
    {
      path: '/ressources',
      name: 'ressources',
      component: () => import('../views/RessourcesView.vue'),
    },
    {
      path: '/arena-duos',
      name: 'arena-duos',
      component: () => import('../views/ArenaDuosView.vue'),
    },
    {
      path: '/arena-resources',
      name: 'arena-resources',
      component: () => import('../views/ArenaResourcesView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (!userStore.currentUserId && to.name === 'arena-duos') {
    return { name: 'home' }
  }

  if (!userStore.currentUserId && to.name === 'arena-resources') {
    return { name: 'home' }
  }
})

export default router
