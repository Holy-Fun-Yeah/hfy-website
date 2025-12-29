/**
 * Admin Configuration
 *
 * IMPORTANT: Admin status is now stored in the database (profiles.is_admin column).
 * Use `useAuth().isAdmin` to check admin status in the app.
 *
 * This file is kept for:
 * 1. E2E test user seeding (test-admin@hfy.test)
 * 2. Initial admin setup reference
 *
 * To grant admin access, set is_admin=true in the profiles table via Supabase dashboard.
 */

/**
 * Known admin emails (for seeding and reference only)
 * @deprecated Use profiles.is_admin column instead
 */
export const ADMIN_EMAILS = [
  'hfy.world@outlook.com',
  'danyiel5978@gmail.com',
  'tim-escher98@outlook.com',
  'test-admin@hfy.test', // E2E testing
] as const

/**
 * Check if an email is in the known admin list
 * @deprecated Use profile.isAdmin from useAuth() instead
 * @param email - The email to check (case-insensitive)
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number])
}

/**
 * Content pages where the Edit button should appear
 */
export const EDITABLE_ROUTES = ['/about', '/blog', '/events'] as const

/**
 * Check if the current route is an editable content page
 * @param path - The route path to check
 */
export function isEditableRoute(path: string): boolean {
  return EDITABLE_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}
