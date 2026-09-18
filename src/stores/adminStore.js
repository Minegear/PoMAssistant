import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false)

  async function checkAdminStatus() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      isAdmin.value = false
      return
    }

    const { data } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    isAdmin.value = !!data
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message

    await checkAdminStatus()
    return null
  }

  async function logout() {
    await supabase.auth.signOut()
    isAdmin.value = false
  }

  return { isAdmin, checkAdminStatus, login, logout }
})