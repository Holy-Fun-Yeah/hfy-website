/**
 * Auth Composable
 *
 * Wraps Supabase auth methods and provides admin checking.
 * Admin status is determined by the `is_admin` column in the profiles table.
 *
 * Auth Flow:
 * 1. Register: POST /api/auth/register → creates auth user + profile
 * 2. Sign In: Supabase client → sync profile if needed
 * 3. Profile: Auto-synced on first login, accessible via profile ref
 *
 * @example
 * ```vue
 * <script setup>
 * const { user, profile, isLoggedIn, isAdmin, signIn, register, signOut } = useAuth()
 * </script>
 * ```
 */

import type { Profile } from '~~/server/database/schema'

// Profile state (shared across components)
const profile = ref<Profile | null>(null)
const profileLoading = ref(false)
const profileError = ref<string | null>(null)

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Reactive computed properties
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.isAdmin ?? false)
  const userEmail = computed(() => user.value?.email)
  const displayName = computed(() => profile.value?.displayName || user.value?.email?.split('@')[0])

  /**
   * Sync or create profile for the current user
   * Called automatically after sign in
   */
  async function syncProfile(): Promise<Profile | null> {
    if (!user.value) {
      profile.value = null
      return null
    }

    profileLoading.value = true
    profileError.value = null

    try {
      const response = await $fetch('/api/auth/sync-profile', {
        method: 'POST',
      })

      // Handle API response (may be success or error wrapped)
      if ('success' in response && response.success && 'data' in response) {
        const data = response.data as { profile?: Profile }
        profile.value = data.profile || null
        return data.profile || null
      }

      // Direct response (in case not wrapped)
      const data = response as { profile?: Profile }
      profile.value = data.profile || null
      return data.profile || null
    } catch (error) {
      profileError.value = error instanceof Error ? error.message : 'Failed to sync profile'
      console.error('Profile sync error:', error)
      return null
    } finally {
      profileLoading.value = false
    }
  }

  /**
   * Fetch current user's profile
   */
  async function fetchProfile(): Promise<Profile | null> {
    if (!user.value) {
      profile.value = null
      return null
    }

    profileLoading.value = true
    profileError.value = null

    try {
      const response = await $fetch('/api/auth/me')

      // Handle API response
      let data: { profile?: Profile | null; needsProfileSync?: boolean }

      if ('success' in response && response.success && 'data' in response) {
        data = response.data as typeof data
      } else {
        data = response as typeof data
      }

      if (data.needsProfileSync) {
        // Profile doesn't exist, create it
        return await syncProfile()
      }

      profile.value = data.profile || null
      return data.profile || null
    } catch (error: unknown) {
      // 401 is expected for unauthenticated users, don't log it
      const is401 = error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401
      if (!is401) {
        profileError.value = error instanceof Error ? error.message : 'Failed to fetch profile'
        console.error('Profile fetch error:', error)
      }
      return null
    } finally {
      profileLoading.value = false
    }
  }

  /**
   * Register a new user with email, password, and profile data
   * Uses our API to create both auth user and profile atomically
   */
  async function register(data: {
    email: string
    password: string
    displayName: string
    pronouns?: string
    phoneCountryCode?: string
    phoneNumber?: string
  }) {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
    })

    return response
  }

  /**
   * Sign in with email and password
   * Automatically syncs profile after successful login
   */
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Sync profile after successful login
    if (data.user) {
      // Use nextTick to ensure user state is updated
      await nextTick()
      await syncProfile()
    }

    return data
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    // Clear profile state
    profile.value = null
    profileError.value = null
  }

  // Auto-fetch profile when user changes
  watch(
    user,
    async (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // User just logged in, fetch profile
        await fetchProfile()
      } else if (!newUser && oldUser) {
        // User logged out, clear profile
        profile.value = null
      }
    },
    { immediate: true }
  )

  return {
    // State
    user,
    profile,
    profileLoading,
    profileError,
    isLoggedIn,
    isAdmin,
    userEmail,
    displayName,

    // Methods
    register,
    signIn,
    signOut,
    syncProfile,
    fetchProfile,
  }
}
