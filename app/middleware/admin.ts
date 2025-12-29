/**
 * Admin Middleware
 *
 * Protects admin routes by checking if the user is authenticated
 * and has admin privileges (via profile.isAdmin in database).
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

export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  // Not logged in - redirect to login page
  if (!user.value) {
    return navigateTo('/login')
  }

  // User is authenticated - page will use useAuth().isAdmin to show content or access denied
  // The isAdmin check is done in the page/component level using profile.isAdmin from database
})
