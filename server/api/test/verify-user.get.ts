/**
 * GET /api/test/verify-user?email=xxx
 *
 * Test-only endpoint to verify user exists in auth.users and public.profiles.
 * Only available in development environment.
 */

import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'

import { db } from '../../database'
import { profiles } from '../../database/schema'
import { env, isDev } from '../../env'
import { defineApiHandler, Errors } from '../../lib'

export default defineApiHandler(async (event) => {
  // Only allow in development
  if (!isDev) {
    throw Errors.forbidden('This endpoint is only available in development')
  }

  const query = getQuery(event)
  const email = query.email as string

  if (!email) {
    throw Errors.badRequest('Email query parameter is required')
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Supabase not configured')
  }

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Check Supabase Auth
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    throw Errors.internal(`Failed to list users: ${listError.message}`)
  }

  const authUser = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  // Check profiles table
  const profileResults = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email.toLowerCase()))
    .limit(1)

  const profile = profileResults[0] || null

  return {
    email,
    existsInAuth: !!authUser,
    existsInProfiles: !!profile,
    authUser: authUser
      ? {
          id: authUser.id,
          email: authUser.email,
          emailConfirmedAt: authUser.email_confirmed_at,
          createdAt: authUser.created_at,
          userMetadata: authUser.user_metadata,
        }
      : null,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          displayName: profile.displayName,
          createdAt: profile.createdAt,
        }
      : null,
  }
})
