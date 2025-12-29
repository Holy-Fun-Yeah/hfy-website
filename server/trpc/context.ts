/**
 * tRPC Context
 *
 * Creates the context for each tRPC request.
 * Provides access to the H3 event, database, and user info.
 */

import type { H3Event } from 'h3'

import { db } from '../database'
import { getUser } from '../utils/auth'

export async function createContext(event: H3Event) {
  // Try to get the authenticated user (may be null if not authenticated)
  const user = await getUser(event).catch(() => null)

  return {
    event,
    db,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
