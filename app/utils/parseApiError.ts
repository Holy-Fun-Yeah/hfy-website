/**
 * Parse API errors into user-friendly messages
 *
 * Handles various error formats:
 * - Network errors (connection refused, timeout, etc.)
 * - API error responses with { error: { message } }
 * - Supabase auth errors
 * - Generic Error objects
 */

export interface ParsedError {
  message: string
  code?: string
  isNetworkError: boolean
  isAuthError: boolean
  isServerError: boolean
}

/**
 * Known error patterns and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  ERR_CONNECTION_REFUSED:
    'Unable to connect to the server. Please check your internet connection and try again.',
  ERR_NETWORK: 'Network error. Please check your internet connection and try again.',
  ERR_TIMEOUT: 'Request timed out. Please try again.',
  FETCH_ERROR: 'Unable to reach the server. Please try again later.',

  // Auth errors (Supabase)
  invalid_credentials: 'Invalid email or password. Please try again.',
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  user_not_found: 'No account found with this email address.',
  email_not_confirmed: 'Please verify your email address before signing in.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  user_already_exists: 'An account with this email already exists.',
  'User already registered': 'An account with this email already exists.',
  weak_password: 'Password is too weak. Please use a stronger password.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',

  // Rate limiting
  too_many_requests: 'Too many attempts. Please wait a moment and try again.',
  'For security purposes': 'Too many attempts. Please wait a moment and try again.',

  // Server errors
  internal_server_error: 'Something went wrong on our end. Please try again later.',
  service_unavailable: 'Service temporarily unavailable. Please try again later.',
}

/**
 * Extract HTTP status code from various error formats
 */
function extractStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null

  // Direct statusCode property (H3/Nuxt errors)
  if ('statusCode' in error && typeof (error as { statusCode: unknown }).statusCode === 'number') {
    return (error as { statusCode: number }).statusCode
  }

  // FetchError from ofetch - check status property
  if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
    return (error as { status: number }).status
  }

  // Check response.status (fetch Response object)
  if ('response' in error) {
    const response = (error as { response: unknown }).response
    if (response && typeof response === 'object' && 'status' in response) {
      const status = (response as { status: unknown }).status
      if (typeof status === 'number') return status
    }
  }

  // Parse from message string (e.g., "503 Service Unavailable")
  const message = extractErrorMessage(error)
  if (message) {
    const match = message.match(/\b(4\d{2}|5\d{2})\b/)
    if (match && match[1]) return parseInt(match[1], 10)
  }

  return null
}

/**
 * Check if error is a network-related error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  const errorStr = String(error)
  return (
    errorStr.includes('ERR_CONNECTION_REFUSED') ||
    errorStr.includes('ERR_NETWORK') ||
    errorStr.includes('NetworkError') ||
    errorStr.includes('Failed to fetch') ||
    errorStr.includes('net::ERR_')
  )
}

/**
 * Extract error message from various error formats
 */
function extractErrorMessage(error: unknown): string | null {
  // Handle FetchError from ofetch/nuxt
  if (error && typeof error === 'object') {
    // ofetch error with data.error.message
    if ('data' in error) {
      const data = (error as { data?: unknown }).data
      if (data && typeof data === 'object') {
        if ('error' in data) {
          const err = (data as { error?: unknown }).error
          if (err && typeof err === 'object' && 'message' in err) {
            return String((err as { message: unknown }).message)
          }
        }
        if ('message' in data) {
          return String((data as { message: unknown }).message)
        }
      }
    }

    // Supabase AuthError
    if ('message' in error) {
      return String((error as { message: unknown }).message)
    }

    // Error with cause
    if ('cause' in error) {
      const cause = (error as { cause: unknown }).cause
      if (cause instanceof Error) {
        return cause.message
      }
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message
  }

  return null
}

/**
 * Parse any error into a user-friendly message
 */
export function parseApiError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): ParsedError {
  const isNetwork = isNetworkError(error)
  const rawMessage = extractErrorMessage(error) || ''

  // Check for known error patterns
  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (rawMessage.includes(pattern) || String(error).includes(pattern)) {
      return {
        message: friendlyMessage,
        code: pattern,
        isNetworkError: isNetwork,
        isAuthError:
          pattern.includes('credentials') ||
          pattern.includes('password') ||
          pattern.includes('email'),
        isServerError: pattern.includes('server') || pattern.includes('unavailable'),
      }
    }
  }

  // Network errors get a specific message
  if (isNetwork) {
    return {
      message: ERROR_MESSAGES.ERR_CONNECTION_REFUSED || 'Unable to connect to the server.',
      code: 'ERR_NETWORK',
      isNetworkError: true,
      isAuthError: false,
      isServerError: false,
    }
  }

  // Server errors (5xx) - check multiple formats
  const statusCode = extractStatusCode(error)
  if (statusCode && statusCode >= 500) {
    const message =
      statusCode === 503
        ? ERROR_MESSAGES.service_unavailable ||
          'Service temporarily unavailable. Please try again later.'
        : ERROR_MESSAGES.internal_server_error || 'Something went wrong. Please try again.'
    return {
      message,
      code: `HTTP_${statusCode}`,
      isNetworkError: false,
      isAuthError: false,
      isServerError: true,
    }
  }

  // Return raw message if it's user-friendly enough, otherwise fallback
  const finalMessage =
    rawMessage && rawMessage.length < 200 && !rawMessage.includes('::')
      ? rawMessage
      : fallbackMessage

  return {
    message: finalMessage,
    isNetworkError: false,
    isAuthError: false,
    isServerError: false,
  }
}

/**
 * Simple helper to get just the message string
 */
export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
  return parseApiError(error, fallbackMessage).message
}
