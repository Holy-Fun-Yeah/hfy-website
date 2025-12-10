import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { langEnum, supportedLanguages } from './common'
import { profiles } from './users'

// ============================================================
// Posts Table (language-agnostic fields / blog entries)
// ============================================================
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  // Slug: URL-friendly identifier (e.g., "healing-journey-begins")
  // Stays consistent across languages for shareable URLs
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false).notNull(),
  // Author references profiles.id (UUID from Supabase auth)
  authorId: uuid('author_id')
    .references(() => profiles.id)
    .notNull(),
  // Media
  bannerUrl: text('banner_url'), // Post header image
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================
// Post Content Table (translatable fields)
// ============================================================
export const postContent = pgTable(
  'post_content',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .references(() => posts.id, { onDelete: 'cascade' })
      .notNull(),
    lang: langEnum('lang').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull(), // Brief text for blog cards
    content: text('content').notNull(), // Markdown content for full post
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('post_content_post_lang_idx').on(table.postId, table.lang)]
)

// ============================================================
// Zod Schemas
// ============================================================

// Post schemas
export const selectPostSchema = createSelectSchema(posts)
export const insertPostSchema = createInsertSchema(posts, {
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  authorId: z.string().uuid('Author ID must be a valid UUID'),
  bannerUrl: z.string().url().optional().nullable(),
})

export const updatePostSchema = insertPostSchema.partial().omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})

// Post content schemas
export const selectPostContentSchema = createSelectSchema(postContent)
export const insertPostContentSchema = createInsertSchema(postContent, {
  postId: z.number().int().positive(),
  lang: z.enum(supportedLanguages),
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
})

export const updatePostContentSchema = insertPostContentSchema.partial().omit({
  id: true,
  postId: true,
  lang: true,
  createdAt: true,
  updatedAt: true,
})

// ============================================================
// Types
// ============================================================
export type Post = z.infer<typeof selectPostSchema>
export type NewPost = z.infer<typeof insertPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
export type PostContent = z.infer<typeof selectPostContentSchema>
export type NewPostContent = z.infer<typeof insertPostContentSchema>
export type UpdatePostContent = z.infer<typeof updatePostContentSchema>

// Combined post with content (for API responses)
export type PostWithContent = Post & {
  content: PostContent
}
