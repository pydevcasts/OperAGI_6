import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  let initialized = false

  async function init() {
    if (initialized) return
    initialized = true

    const { supabase } = await import('~/utils/supabase')

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  async function login(email: string, password: string) {
    error.value = null
    const { supabase } = await import('~/utils/supabase')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      error.value = err.message
      throw err
    }
    user.value = data.user
  }

  async function register(email: string, password: string) {
    error.value = null
    const { supabase } = await import('~/utils/supabase')

    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      error.value = err.message
      throw err
    }
    user.value = data.user
  }

  async function logout() {
    const { supabase } = await import('~/utils/supabase')
    await supabase.auth.signOut()
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    init,
    login,
    register,
    logout,
  }
})
