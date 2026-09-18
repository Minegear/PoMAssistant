import { ref } from 'vue'

const syncPairs = ref([])
const isLoaded = ref(false)

export function useSyncPairs() {
    async function loadSyncPairs() {
        if (isLoaded.value) return

        const response = await fetch ('/data/syncpairs.json')
        const data = await response.json()
        syncPairs.value = data.SYNCPAIRS
        isLoaded.value = true
    }

    return { syncPairs, isLoaded, loadSyncPairs }
}