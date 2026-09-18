import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useArenaUserResources() {
  const arenaUserResources = ref([])

  async function loadArenaUserResources(userIds) {
    const { data, error } = await supabase.from('user_resources').select('*').in('user_id', userIds)

    if (error) {
      console.error('Erreur chargement user_resources:', error)
      return
    }

    arenaUserResources.value = data
  }

  return { arenaUserResources, loadArenaUserResources }
}
