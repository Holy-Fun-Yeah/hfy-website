/**
 * Server-side Auth Utilities
 *
 * Helpers for authenticating and authorizing API requests.
 * Uses Supabase auth on the server side.
 */

import type { H3Event } from 'h3'

import { Errors } from '../lib'

import { serverSupabaseUser } from '#supabase/server'

// Admin email allowlist - must match app/config/admin.ts
const ADMIN_EMAILS = ['hfy.world@outlook.com', 'danyiel5978@gmail.com'] as const

/**
 * Check if an email has admin privileges
 */
function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number])
}

/**
 * Get the authenticated user from the request
 * Returns null if not authenticated
 */
export async function getUser(event: H3Event) {
  return await serverSupabaseUser(event)
}

/**
 * Normalized user object returned from requireAuth
 * Maps JWT claims to more intuitive property names
 */
export interface AuthUser {
  id: string
  email: string | undefined
  emailConfirmedAt: string | undefined
  lastSignInAt: string | undefined
  userMetadata: Record<string, unknown>
}

/**
 * Require authentication for an API route
 * Throws 401 if user is not authenticated
 *
 * Note: serverSupabaseUser returns JWT payload where:
 * - `sub` = user ID (not `id`)
 * - `email` = user email
 * - `user_metadata` = custom metadata
 */
export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const jwtUser = await serverSupabaseUser(event)

  if (!jwtUser) {
    throw Errors.unauthorized('Authentication required')
  }

  // Map JWT claims to normalized user object
  // The JWT `sub` claim contains the user ID
  return {
    id: jwtUser.sub as string,
    email: jwtUser.email,
    emailConfirmedAt: jwtUser.email_confirmed_at as string | undefined,
    lastSignInAt: jwtUser.last_sign_in_at as string | undefined,
    userMetadata: (jwtUser.user_metadata as Record<string, unknown>) || {},
  }
}

/**
 * Require admin authentication for an API route
 * Throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)

  if (!isAdminEmail(user.email)) {
    throw Errors.forbidden('Admin access required')
  }

  return user
}

/**
 * Require that the authenticated user is either:
 * 1. The owner of the resource (their own user ID matches targetUserId)
 * 2. An admin
 *
 * Use this for endpoints like /api/auth/profile where users can edit
 * their own data, but admins can also edit any user's data.
 *
 * @param event - H3 event
 * @param targetUserId - The user ID of the resource being accessed (optional)
 *                       If not provided, only checks authentication
 * @returns The authenticated user and whether they are admin
 */
export async function requireOwnerOrAdmin(event: H3Event, targetUserId?: string) {
  const user = await requireAuth(event)
  const isAdmin = isAdminEmail(user.email)

  // If no target specified, just return auth info
  if (!targetUserId) {
    return { user, isAdmin, isOwner: true }
  }

  const isOwner = user.id === targetUserId

  // Must be either owner or admin
  if (!isOwner && !isAdmin) {
    throw Errors.forbidden('You can only access your own resources')
  }

  return { user, isAdmin, isOwner }
}

/**
 * Check if current user is admin (without throwing)
 */
export async function checkIsAdmin(event: H3Event): Promise<boolean> {
  const user = await serverSupabaseUser(event)
  return isAdminEmail(user?.email)
}
