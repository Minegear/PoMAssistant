import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

const arenas = ref([])
const isLoadedArenas = ref(false)

export function useArenas() {
  async function loadArenas() {
    if (isLoadedArenas.value) return

    const { data, error } = await supabase.from('arenas').select('*')

    if (error) {
      console.error('Erreur chargement arenas:', error)
      return
    }

    arenas.value = data
    isLoadedArenas.value = true
  }

  const defaultArenaId = computed(() => arenas.value.find((a) => a.is_default)?.id ?? null)

  return { arenas, isLoadedArenas, loadArenas, defaultArenaId }
}
