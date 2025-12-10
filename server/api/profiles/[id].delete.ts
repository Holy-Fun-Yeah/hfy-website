/**
 * DELETE /api/profiles/[id]
 *
 * Soft-delete a user's account. Accessible by:
 * - The profile owner (for their own account)
 * - Admins (for any account)
 *
 * Soft-delete strategy (Option D):
 * 1. Requires confirmation (user must type their email or "DELETE")
 * 2. Sets deletedAt timestamp on profile
 * 3. Bans the auth user (doesn't delete - preserves FK integrity)
 * 4. User is signed out and can't sign back in
 * 5. Email remains locked (can't re-register with same email)
 * 6. Admin can restore account by unbanning + clearing deletedAt
 *
 * Why not delete auth.users?
 * - profiles.id has FK to auth.users with ON DELETE CASCADE
 * - Deleting auth user would hard-delete profile, losing history
 * - Banning achieves same UX (can't login) while preserving data
 */

import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { profiles } from '../../database/schema'
import { env } from '../../env'
import { defineApiHandler, Errors } from '../../lib'
import { requireOwnerOrAdmin } from '../../utils/auth'

// UUID validation
const uuidSchema = z.string().uuid()

// Confirmation schema
const deleteConfirmationSchema = z.object({
  confirmation: z.string().min(1, 'Confirmation is required'),
})

export default defineApiHandler(async (event) => {
  // Validate profile ID
  const profileId = getRouterParam(event, 'id')
  const parsedId = uuidSchema.safeParse(profileId)
  if (!parsedId.success) {
    throw Errors.badRequest('Invalid profile ID (must be UUID)')
  }

  // Check authorization (must be owner or admin)
  const { isAdmin, isOwner } = await requireOwnerOrAdmin(event, parsedId.data)

  // Validate confirmation
  const body = await readBody(event)
  const parsed = deleteConfirmationSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation('Confirmation is required to delete account')
  }

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Get profile to verify it exists and get email for confirmation
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, parsedId.data))
    .limit(1)

  if (!existingProfile) {
    throw Errors.notFound('Profile not found')
  }

  if (existingProfile.deletedAt) {
    throw Errors.badRequest('Account has already been deleted')
  }

  // Verify confirmation
  // User must type "DELETE" or their email address
  const confirmationLower = parsed.data.confirmation.toLowerCase()
  const emailLower = existingProfile.email.toLowerCase()

  if (confirmationLower !== 'delete' && confirmationLower !== emailLower) {
    throw Errors.badRequest('Invalid confirmation. Please type "DELETE" or your email address.')
  }

  // Ensure we have Supabase admin access
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Auth service not configured')
  }

  // Create Supabase admin client
  const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Ban the auth user first (this will sign them out)
  // We do this before updating profile so if it fails, we don't have inconsistent state
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(parsedId.data, {
    ban_duration: 'none', // Permanent ban (until manually unbanned)
  })

  if (banError) {
    console.error('Failed to ban auth user:', banError)
    throw Errors.internal('Failed to deactivate account. Please try again.')
  }

  // Soft-delete the profile
  const deletedAt = new Date()
  const [updatedProfile] = await db
    .update(profiles)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(eq(profiles.id, parsedId.data))
    .returning()

  return {
    message: 'Account deactivated successfully',
    deletedAt: updatedProfile?.deletedAt ?? deletedAt,
    deletedBy: isAdmin && !isOwner ? 'admin' : 'owner',
    canRestore: true, // Admin can restore by unbanning + clearing deletedAt
  }
})
