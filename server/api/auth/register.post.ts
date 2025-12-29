/**
 * POST /api/auth/register
 *
 * Register a new user with email/password and create their profile.
 * This endpoint:
 * 1. Validates input
 * 2. Creates user in Supabase Auth
 * 3. Creates profile in our profiles table (transactionally)
 *
 * Uses Supabase Admin API (service key) for server-side user creation.
 */

import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { useDatabase } from '../../database'
import {
  phoneCountryCodeSchema,
  phoneNumberSchema,
  profiles,
  pronounsSchema,
} from '../../database/schema'
import { env } from '../../env'
import { defineApiHandler, Errors } from '../../lib'

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  pronouns: pronounsSchema.optional().nullable(),
  phoneCountryCode: phoneCountryCodeSchema,
  phoneNumber: phoneNumberSchema,
})

export default defineApiHandler(async (event) => {
  const db = useDatabase()

  // Validate request body
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { email, password, displayName, pronouns, phoneCountryCode, phoneNumber } = parsed.data

  // Ensure we have required env vars
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Auth service not configured')
  }

  // Create Supabase admin client (uses secret key for admin operations)
  const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check if user already exists in our profiles table
  const existingProfile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email.toLowerCase()))
    .limit(1)

  if (existingProfile.length > 0) {
    throw Errors.conflict('An account with this email already exists')
  }

  // Create user in Supabase Auth
  // Format phone as E.164 for Supabase metadata
  const phoneE164 = phoneCountryCode && phoneNumber ? `+${phoneCountryCode}${phoneNumber}` : ''

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // User will need to confirm email
    user_metadata: {
      display_name: displayName,
      phone: phoneE164,
    },
  })

  if (authError) {
    // Handle specific Supabase errors
    if (authError.message.includes('already registered')) {
      throw Errors.conflict('An account with this email already exists')
    }
    throw Errors.badRequest(authError.message)
  }

  if (!authData.user) {
    throw Errors.internal('Failed to create user account')
  }

  // Create/update profile in our database
  // Note: A database trigger (handle_new_user) auto-creates a basic profile when
  // the auth user is created. We use ON CONFLICT to update with additional fields.
  try {
    await db
      .insert(profiles)
      .values({
        id: authData.user.id,
        email: email.toLowerCase(),
        displayName,
        pronouns: pronouns || null,
        phoneCountryCode: phoneCountryCode || null,
        phoneNumber: phoneNumber || null,
        bio: null,
        avatarUrl: null,
        newsletterSubscribed: true, // Default to subscribed
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          displayName,
          pronouns: pronouns || null,
          phoneCountryCode: phoneCountryCode || null,
          phoneNumber: phoneNumber || null,
          updatedAt: new Date(),
        },
      })
  } catch (dbError) {
    // If profile creation fails, we should clean up the auth user
    // to maintain consistency
    console.error('[Register] Profile upsert failed, deleting auth user:', dbError)
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

    throw Errors.internal('Failed to create user profile')
  }

  // Send confirmation email
  // Note: Supabase handles this automatically if email confirmations are enabled
  // in your Supabase project settings

  return {
    message: 'Account created successfully. Please check your email to verify your account.',
    userId: authData.user.id,
    email: authData.user.email,
    requiresEmailConfirmation: !authData.user.email_confirmed_at,
  }
})
