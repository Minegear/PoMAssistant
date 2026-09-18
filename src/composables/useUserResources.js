import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export function useUserResources() {
  const resourceCounts = ref({})

  async function loadUserResources(userId) {
    const { data, error } = await supabase.from('user_resources').select('*').eq('user_id', userId)

    if (error) {
      console.error('Erreur chargement user_resources:', error)
      return
    }

    resourceCounts.value = data.reduce((acc, row) => {
      acc[row.resource_id] = row.count
      return acc
    }, {})
  }

  async function updateResourceCount(userId, resourceId, newCount) {
    const oldValue = resourceCounts.value[resourceId]

    resourceCounts.value[resourceId] = newCount

    const { error } = await supabase
      .from('user_resources')
      .upsert(
        { user_id: userId, resource_id: resourceId, count: newCount },
        { onConflict: 'user_id, resource_id' },
      )

    if (error) {
      console.error('Erreur update user_resources:', error)
      resourceCounts.value[resourceId] = oldValue
    }
  }

  return { resourceCounts, loadUserResources, updateResourceCount }
}
