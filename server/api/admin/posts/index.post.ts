/**
 * POST /api/admin/posts
 *
 * Create or update a blog post with all language content.
 * Admin-only endpoint.
 *
 * Upsert behavior:
 * - If `id` is provided: Update existing post
 * - If `id` is omitted: Create new post
 *
 * Request body must include content for ALL supported languages.
 * Frontend is responsible for translations before submission.
 *
 * Uses database transaction for atomicity:
 * 1. Upsert post record
 * 2. Upsert all 4 language content records
 */

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../../database'
import {
  postContent,
  posts,
  supportedLanguages,
  type SupportedLanguage,
} from '../../../database/schema'
import { defineApiHandler, Errors } from '../../../lib'
import { requireAdmin } from '../../../utils/auth'

// Content schema for a single language
const langContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
})

// Build content schema requiring all supported languages
const contentSchema = z.object(
  Object.fromEntries(supportedLanguages.map((lang) => [lang, langContentSchema])) as {
    [K in (typeof supportedLanguages)[number]]: typeof langContentSchema
  }
)

// Main request schema
const upsertPostSchema = z.object({
  id: z.number().int().positive().optional(), // Omit for create, include for update
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  bannerUrl: z.string().url().optional().nullable(),
  published: z.boolean().default(false),
  content: contentSchema,
})

export default defineApiHandler(async (event) => {
  // Require admin access
  const admin = await requireAdmin(event)

  // Validate request body
  const body = await readBody(event)
  const parsed = upsertPostSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }

  const { id, slug, bannerUrl, published, content } = parsed.data

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Check for slug conflict (different post with same slug)
  const existingWithSlug = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1)

  if (existingWithSlug.length > 0 && existingWithSlug[0]?.id !== id) {
    throw Errors.conflict(`A post with slug "${slug}" already exists`)
  }

  // If updating, verify post exists
  if (id) {
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1)

    if (existing.length === 0) {
      throw Errors.notFound(`Post with id ${id} not found`)
    }
  }

  // Execute upsert in a transaction
  const result = await db.transaction(async (tx) => {
    let postId: number

    if (id) {
      // Update existing post
      const [updated] = await tx
        .update(posts)
        .set({
          slug,
          bannerUrl: bannerUrl ?? null,
          published,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning()

      if (!updated) {
        throw Errors.internal('Failed to update post')
      }

      postId = updated.id
    } else {
      // Create new post
      const [created] = await tx
        .insert(posts)
        .values({
          slug,
          bannerUrl: bannerUrl ?? null,
          published,
          authorId: admin.id,
        })
        .returning()

      if (!created) {
        throw Errors.internal('Failed to create post')
      }

      postId = created.id
    }

    // Upsert content for all languages
    const contentResults: Record<string, { title: string; excerpt: string; isNew: boolean }> = {}

    for (const lang of supportedLanguages) {
      const langContent = content[lang]

      // Check if content exists for this specific language
      const [existingForThisLang] = await tx
        .select({ id: postContent.id })
        .from(postContent)
        .where(and(eq(postContent.postId, postId), eq(postContent.lang, lang)))
        .limit(1)

      if (existingForThisLang) {
        // Update existing
        await tx
          .update(postContent)
          .set({
            title: langContent.title,
            excerpt: langContent.excerpt,
            content: langContent.content,
            updatedAt: new Date(),
          })
          .where(eq(postContent.id, existingForThisLang.id))

        contentResults[lang] = {
          title: langContent.title,
          excerpt: langContent.excerpt,
          isNew: false,
        }
      } else {
        // Insert new
        await tx.insert(postContent).values({
          postId,
          lang: lang as SupportedLanguage,
          title: langContent.title,
          excerpt: langContent.excerpt,
          content: langContent.content,
        })

        contentResults[lang] = {
          title: langContent.title,
          excerpt: langContent.excerpt,
          isNew: true,
        }
      }
    }

    // Fetch the complete post with all content
    const [finalPost] = await tx.select().from(posts).where(eq(posts.id, postId)).limit(1)

    if (!finalPost) {
      throw Errors.internal('Failed to fetch created post')
    }

    const finalContent = await tx.select().from(postContent).where(eq(postContent.postId, postId))

    return {
      post: finalPost,
      content: finalContent,
      contentResults,
    }
  })

  // Format response
  const contentByLang = Object.fromEntries(
    result.content.map((c) => [
      c.lang,
      {
        title: c.title,
        excerpt: c.excerpt,
        content: c.content,
        isNew: result.contentResults[c.lang]?.isNew ?? false,
      },
    ])
  )

  return {
    message: id ? 'Post updated successfully' : 'Post created successfully',
    post: {
      id: result.post.id,
      slug: result.post.slug,
      bannerUrl: result.post.bannerUrl,
      published: result.post.published,
      authorId: result.post.authorId,
      createdAt: result.post.createdAt,
      updatedAt: result.post.updatedAt,
    },
    content: contentByLang,
  }
})
