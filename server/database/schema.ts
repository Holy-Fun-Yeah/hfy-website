import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================
// Users Table
// ============================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas derived from Drizzle table
export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  avatarUrl: z.string().url().optional().nullable(),
})

// Partial schema for updates (all fields optional)
export const updateUserSchema = insertUserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Type exports derived from Zod schemas
export type User = z.infer<typeof selectUserSchema>
export type NewUser = z.infer<typeof insertUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

// ============================================================
// Posts Table
// ============================================================
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas derived from Drizzle table
export const selectPostSchema = createSelectSchema(posts)
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  authorId: z.number().int().positive(),
})

// Partial schema for updates
export const updatePostSchema = insertPostSchema.partial().omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})

// Type exports derived from Zod schemas
export type Post = z.infer<typeof selectPostSchema>
export type NewPost = z.infer<typeof insertPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
