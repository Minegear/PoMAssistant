import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const curatedPairs = ref([])
const isLoaded = ref(false)
const loadedArenaId = ref(null)

async function fetchCuratedPairs(arenaId) {
  const { data, error } = await supabase.from('curated_pairs').select('*').eq('arena_id', arenaId)

  if (error) {
    console.error('Erreur chargement curated_pairs:', error)
    return
  }

  curatedPairs.value = data
  isLoaded.value = true
}

async function insertCuratedPairs(duoKeys, added_by, arena_id) {
  const rowsToInsert = duoKeys.map((duo) => {
    return { duo_key: duo, added_by: added_by, arena_id: arena_id }
  })
  const { error } = await supabase
    .from('curated_pairs')
    .upsert(rowsToInsert, { onConflict: 'duo_key, arena_id' })
  if (error === null) {
    await fetchCuratedPairs(arena_id)
  } else {
    console.error('Erreur insertion curated_pairs:', error)
    return
  }
}

async function deleteCuratedPairs(duoKeys, arenaId) {
  const { error } = await supabase
    .from('curated_pairs')
    .delete()
    .in('duo_key', duoKeys)
    .eq('arena_id', arenaId)
  if (error === null) {
    await fetchCuratedPairs(arenaId)
  } else {
    console.error('Erreur suppresion curated_pairs:', error)
    return
  }
}

export function useCuratedPairs() {
  async function loadCuratedPairs(arenaId) {
    if (loadedArenaId.value === arenaId) return
    await fetchCuratedPairs(arenaId)
    loadedArenaId.value = arenaId
  }

  return { curatedPairs, isLoaded, loadCuratedPairs, insertCuratedPairs, deleteCuratedPairs }
}
