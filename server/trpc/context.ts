/**
 * tRPC Context
 *
 * Creates the context for each tRPC request.
 * Provides access to the H3 event, database, and user info.
 */

import type { H3Event } from 'h3'

import { db } from '../database'
import { getUser, type AuthUser } from '../utils/auth'

export async function createContext(event: H3Event) {
  // Try to get the authenticated user (may be null if not authenticated)
  const jwtUser = await getUser(event).catch(() => null)

  // Map JWT claims to normalized user object
  // The JWT `sub` claim contains the user ID
  const user: AuthUser | null = jwtUser
    ? {
        id: jwtUser.sub as string,
        email: jwtUser.email,
        emailConfirmedAt: jwtUser.email_confirmed_at as string | undefined,
        lastSignInAt: jwtUser.last_sign_in_at as string | undefined,
        userMetadata: (jwtUser.user_metadata as Record<string, unknown>) || {},
      }
    : null

  return {
    event,
    db,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
