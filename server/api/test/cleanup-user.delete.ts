/**
 * DELETE /api/test/cleanup-user
 *
 * Test-only endpoint to cleanup test users.
 * Only available in development environment.
 *
 * Deletes user from both auth.users (Supabase) and public.profiles.
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

  const { email } = await readBody(event)

  if (!email || typeof email !== 'string') {
    throw Errors.badRequest('Email is required')
  }

  // Only allow cleanup of test emails (safety check)
  if (!email.includes('test') && !email.includes('e2e')) {
    throw Errors.forbidden('Can only cleanup test/e2e emails')
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

  // Find user in Supabase Auth
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    throw Errors.internal(`Failed to list users: ${listError.message}`)
  }

  const authUser = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  let authDeleted = false
  let profileDeleted = false

  // Delete from Supabase Auth if exists
  if (authUser) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError)
    } else {
      authDeleted = true
    }
  }

  // Delete from profiles table if exists
  const deleted = await db.delete(profiles).where(eq(profiles.email, email.toLowerCase()))

  if (deleted) {
    profileDeleted = true
  }

  return {
    message: 'Cleanup complete',
    email,
    authDeleted,
    profileDeleted,
  }
})
