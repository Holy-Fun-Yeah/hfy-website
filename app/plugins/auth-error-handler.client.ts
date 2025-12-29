/**
 * Auth Callback Handler Plugin
 *
 * Handles Supabase auth callbacks that land on any page:
 * 1. Error callbacks: Redirects to /login with friendly error message
 * 2. Success callbacks: Waits for Supabase to process token, then redirects appropriately
 *
 * Supabase may redirect to any page with:
 * - Errors: ?error=access_denied&error_code=otp_expired&error_description=...
 * - Success: #access_token=...&type=signup (email confirmation)
 */

// Error message mapping for user-friendly display
const ERROR_MESSAGES: Record<string, string> = {
  otp_expired: 'Your confirmation link has expired. Please request a new one.',
  access_denied: 'Access was denied. Please try again.',
  invalid_request: 'Invalid request. Please try signing in again.',
  unauthorized_client: 'Authentication error. Please try again.',
  server_error: 'A server error occurred. Please try again later.',
}

export default defineNuxtPlugin({
  name: 'auth-callback-handler',
  enforce: 'pre',
  async setup(nuxtApp) {
    // Only run on client
    if (!import.meta.client) return

    // Wait for app to be mounted
    nuxtApp.hook('app:mounted', () => {
      handleAuthCallback()
    })
  },
})

function handleAuthCallback() {
  const pathname = window.location.pathname
  const search = window.location.search
  const hash = window.location.hash

  // Skip if already on login or auth confirm page
  if (pathname === '/login' || pathname === '/auth/confirm') return

  // Parse query params
  const queryParams = new URLSearchParams(search)

  // Parse hash fragment
  const hashParams = hash ? new URLSearchParams(hash.slice(1)) : null

  // Check for errors (query params or hash)
  const error = queryParams.get('error') || hashParams?.get('error') || null
  const errorCode = queryParams.get('error_code') || hashParams?.get('error_code') || null
  const errorDescription =
    queryParams.get('error_description') || hashParams?.get('error_description') || null

  if (error) {
    // Get user-friendly message
    const friendlyMessage =
      ERROR_MESSAGES[errorCode || ''] ||
      errorDescription?.replace(/\+/g, ' ') ||
      'An authentication error occurred.'

    // Redirect to login with error message using window.location
    const loginUrl = new URL('/login', window.location.origin)
    loginUrl.searchParams.set('auth_error', friendlyMessage)
    if (errorCode) loginUrl.searchParams.set('error_code', errorCode)

    window.location.replace(loginUrl.toString())
    return
  }

  // Check for successful auth callback (access_token in hash)
  const accessToken = hashParams?.get('access_token') || null
  const callbackType = hashParams?.get('type') || null

  if (accessToken) {
    handleSuccessCallback(callbackType)
  }
}

async function handleSuccessCallback(callbackType: string | null) {
  // Wait for Supabase to process the token
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const supabase = useSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    // Determine redirect based on callback type
    // Note: Admin redirect is handled by /member page after profile loads
    let redirectUrl: string

    if (callbackType === 'signup') {
      redirectUrl = '/login?message=email_confirmed'
    } else if (callbackType === 'recovery') {
      redirectUrl = '/reset-password'
    } else {
      // Redirect to member portal - it will redirect to /admin if user is admin
      redirectUrl = '/member'
    }

    // Use window.location to redirect (cleaner than router for callbacks)
    window.location.replace(redirectUrl)
  }
}
