import { db } from '../../database'
import { insertUserSchema, users } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

export default defineApiHandler(async (event) => {
  // Validate first (can test without DB)
  const data = insertUserSchema.parse(await readBody(event))

  // Then check DB
  if (!db) throw Errors.serviceUnavailable('Database not available')

  const [newUser] = await db.insert(users).values(data).returning()

  return newUser
})
