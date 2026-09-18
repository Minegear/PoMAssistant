import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const historyRows = ref([])

export function useHistory() {
  async function loadHistory() {
    const { data, error } = await supabase.from('history').select('*')

    if (error) {
      console.error('Erreur chargement history:', error)
      return
    }

    historyRows.value = data
  }

  async function saveHistory(rows) {
    const { error } = await supabase.from('history').insert(rows)
    if (error) {
      console.error('Erreur sauvegarde history:', error)
      return
    }
  }

  return { historyRows, loadHistory, saveHistory }
}
