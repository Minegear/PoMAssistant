import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const trackedPairs = ref([])

export function useTrackedPairs() {
  async function loadTrackedPairs(userId) {
    const { data, error } = await supabase.from('tracked_pairs').select('*').eq('user_id', userId)

    if (error) {
      console.error('Erreur chargement tracked_pairs:', error)
      return
    }

    trackedPairs.value = data
  }

  async function saveTrackedPairs(user_id, trackedTable) {
    const { error } = await supabase
      .from('tracked_pairs')
      .upsert(trackedTable, { onConflict: 'duo_key, user_id' })
    if (error === null) {
      await loadTrackedPairs(user_id)
      return true
    } else {
      console.error('Erreur update tracked_pairs:', error)
      return false
    }
  }

  function clearTrackedPairs() {
    trackedPairs.value = []
  }

  return { trackedPairs, loadTrackedPairs, saveTrackedPairs, clearTrackedPairs }
}
