import { eq } from 'drizzle-orm'

import { db } from '../../database'
import { users } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

export default defineApiHandler(async (event) => {
  // Validate first (can test without DB)
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id) || id <= 0) throw Errors.badRequest('Invalid user ID')

  // Then check DB
  if (!db) throw Errors.serviceUnavailable('Database not available')

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw Errors.notFound('User not found')

  return user
})
