/**
 * Admin Middleware
 *
 * Protects admin routes by checking if the user is authenticated
 * and has admin privileges (via email allowlist).
 *
 * - Not logged in: redirects to /login
 * - Logged in but not admin: page handles showing access denied
 *
 * Usage in page:
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: 'admin'
 * })
 * </script>
 * ```
 */

import { isAdminEmail } from '~/config/admin'

export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  // Not logged in - redirect to login page
  if (!user.value) {
    return navigateTo('/login')
  }

  // Logged in but not admin - let the page handle showing access denied
  if (!isAdminEmail(user.value.email)) {
    return
  }

  // User is admin - allow access
})
