/**
 * Admin Configuration
 *
 * Defines which email addresses have admin access.
 * This is a simple allowlist approach - suitable for a small number of known admins.
 */

export const ADMIN_EMAILS = ['hfy.world@outlook.com', 'danyiel5978@gmail.com'] as const

/**
 * Check if an email address has admin privileges
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
