/**
 * Centralized Environment Configuration
 *
 * All server-side env vars are loaded here. This ensures:
 * 1. No API key leakage to frontend (all requests go through server)
 * 2. Build-time validation of required env vars
 * 3. Type-safe access to env vars throughout the server
 *
 * Usage:
 *   import { env } from '../env'
 *   console.log(env.APP_ENV)
 */

import { z } from 'zod'

// =============================================================================
// Schema Definition
// =============================================================================

const envSchema = z.object({
  // Required
  APP_ENV: z.enum(['development', 'staging', 'production']),

  // Optional (services degrade gracefully)
  DATABASE_URL: z.string().optional(),
})

// =============================================================================
// Load and Validate
// =============================================================================

const result = envSchema.safeParse(process.env)

if (!result.success) {
  const errors = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
  throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
}

export const env = result.data

// =============================================================================
// Helpers
// =============================================================================

export const isDev = env.APP_ENV === 'development'
export const isStaging = env.APP_ENV === 'staging'
export const isProd = env.APP_ENV === 'production'
