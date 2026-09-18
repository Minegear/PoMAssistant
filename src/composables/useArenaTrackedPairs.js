import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useArenaTrackedPairs() {
  const arenaTrackedPairs = ref([])

  async function loadArenaTrackedPairs(userIds) {
    const { data, error } = await supabase.from('tracked_pairs').select('*').in('user_id', userIds)

    if (error) {
      console.error('Erreur chargement tracked_pairs:', error)
      return
    }

    arenaTrackedPairs.value = data
  }

  return { arenaTrackedPairs, loadArenaTrackedPairs }
}
