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

  // Database (Drizzle + Postgres via Supabase)
  DATABASE_URL: z.string().optional(),

  // Supabase (Auth + Realtime)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLIC_KEY: z.string().optional(), // Client-side publishable key
  SUPABASE_SECRET_KEY: z.string().optional(), // Server-side only, admin access

  // Stripe (Payments)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_PUBLIC_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
})

// =============================================================================
// Load and Validate
// =============================================================================

const result = envSchema.safeParse(process.env)

if (!result.success) {
  const errors = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
  // In development, warn but provide defaults. In production, fail hard.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  } else {
    console.warn(`[env] Environment validation warnings:\n${errors.join('\n')}`)
  }
}

// Provide defaults for development
export const env = result.success
  ? result.data
  : {
      APP_ENV: 'development' as const,
      DATABASE_URL: undefined,
      SUPABASE_URL: undefined,
      SUPABASE_PUBLIC_KEY: undefined,
      SUPABASE_SECRET_KEY: undefined,
      STRIPE_SECRET_KEY: undefined,
      STRIPE_PUBLIC_KEY: undefined,
      STRIPE_WEBHOOK_SECRET: undefined,
    }

// =============================================================================
// Helpers
// =============================================================================

export const isDev = env.APP_ENV === 'development'
export const isStaging = env.APP_ENV === 'staging'
export const isProd = env.APP_ENV === 'production'
