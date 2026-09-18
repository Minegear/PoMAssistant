import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAdminStore } from './adminStore'

export const useUserStore = defineStore('user', () => {
  const currentUserId = ref(localStorage.getItem('currentUserId') || null)
  const currentArenaId = ref(localStorage.getItem('currentArenaId') || null)

  function selectUser(userId, arenaId) {
    currentUserId.value = userId
    currentArenaId.value = arenaId
  }

  watch(currentUserId, (newId) => {
    if (newId) {
      localStorage.setItem('currentUserId', newId)
    } else {
      localStorage.removeItem('currentUserId')
    }
  })

  watch(currentArenaId, (newId) => {
    if (newId) {
      localStorage.setItem('currentArenaId', newId)
    } else {
      localStorage.removeItem('currentArenaId')
    }
  })

  async function logout() {
    const adminStore = useAdminStore()
    await adminStore.logout()
    currentUserId.value = null
    currentArenaId.value = null
  }

  return { currentUserId, currentArenaId, selectUser, logout }
})
