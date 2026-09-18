import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const users = ref([])
const isLoaded = ref(false)

export function useUsers() {
  async function loadUsers() {
    if (isLoaded.value) return

    const { data, error } = await supabase.from('users_public').select('*')

    if (error) {
      console.error('Erreur chargement users:', error)
      return
    }

    users.value = data
    isLoaded.value = true
  }

  return { users, isLoaded, loadUsers }
}
