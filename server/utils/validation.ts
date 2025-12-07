import { z } from 'zod'

import {
  selectUserSchema,
  insertUserSchema,
  updateUserSchema,
  selectPostSchema,
  insertPostSchema,
  updatePostSchema,
} from '../database/schema'

// Re-export schemas from database schema (single source of truth)
export {
  selectUserSchema,
  insertUserSchema,
  updateUserSchema,
  selectPostSchema,
  insertPostSchema,
  updatePostSchema,
}

// Re-export types
export type { User, NewUser, UpdateUser, Post, NewPost, UpdatePost } from '../database/schema'

// ============================================================
// Common Validation Schemas
// ============================================================

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ============================================================
// Request Validation Schemas
// ============================================================

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ID param schema
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T extends z.ZodType>(
  event: Parameters<typeof readBody>[0],
  schema: T
): Promise<z.infer<T>> {
  const body = await readBody(event)
  return schema.parse(body)
}

/**
 * Validate query params against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(
  event: Parameters<typeof getQuery>[0],
  schema: T
): z.infer<T> {
  const query = getQuery(event)
  return schema.parse(query)
}

/**
 * Safe validation that returns result instead of throwing
 */
export async function safeValidateBody<T extends z.ZodType>(
  event: Parameters<typeof readBody>[0],
  schema: T
): Promise<z.SafeParseReturnType<unknown, z.infer<T>>> {
  const body = await readBody(event)
  return schema.safeParse(body)
}

/**
 * Safe validation for query params
 */
export function safeValidateQuery<T extends z.ZodType>(
  event: Parameters<typeof getQuery>[0],
  schema: T
): z.SafeParseReturnType<unknown, z.infer<T>> {
  const query = getQuery(event)
  return schema.safeParse(query)
}

// Type exports for common patterns
export type PaginationInput = z.infer<typeof paginationSchema>
export type IdParamInput = z.infer<typeof idParamSchema>
