import { db } from '../../database'
import { users } from '../../database/schema'
import { createPaginationInfo, definePaginatedApiHandler, Errors } from '../../lib'
import { paginationSchema } from '../../utils/validation'

export default definePaginatedApiHandler(async (event) => {
  // Validate first (can test without DB)
  const { page, limit } = paginationSchema.parse(getQuery(event))

  // Then check DB
  if (!db) throw Errors.serviceUnavailable('Database not available')

  const offset = (page - 1) * limit
  const result = await db.select().from(users).limit(limit).offset(offset)

  // In production, add a count query for accurate total
  const pagination = createPaginationInfo(result.length, page, limit)

  return [result, pagination]
})
