/**
 * GET /api/posts/[slug]
 *
 * Get a single blog post by slug with full content.
 *
 * Query params:
 * - lang: Language code (en, es, de, fr) - defaults to 'en'
 *
 * Response includes:
 * - Full post metadata
 * - Author info (displayName, avatarUrl)
 * - Full translated content (title, excerpt, content) in requested language
 * - isFallback: true if content fell back to English
 * - availableLanguages: array of languages this post has content in
 *
 * Uses language fallback: tries requested lang, falls back to English.
 */

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { postContent, posts, profiles, supportedLanguages } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

// Query schema
const querySchema = z.object({
  lang: z.enum(supportedLanguages).default('en'),
})

// Slug validation
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200)
  .regex(/^[a-z0-9-]+$/, 'Invalid slug format')

// Default language for fallback
const DEFAULT_LANG = 'en'

export default defineApiHandler(async (event) => {
  // Validate slug param
  const slugParam = getRouterParam(event, 'slug')
  const parsedSlug = slugSchema.safeParse(slugParam)
  if (!parsedSlug.success) {
    throw Errors.badRequest('Invalid slug format')
  }
  const slug = parsedSlug.data

  // Validate query params
  const { lang } = querySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  // Get the post with author info
  const [post] = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      published: posts.published,
      bannerUrl: posts.bannerUrl,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(posts)
    .leftJoin(profiles, eq(profiles.id, posts.authorId))
    .where(eq(posts.slug, slug))
    .limit(1)

  if (!post) {
    throw Errors.notFound('Post not found')
  }

  // Only show published posts to non-admin users
  // (Admin check would go here if needed)
  if (!post.published) {
    throw Errors.notFound('Post not found')
  }

  // Get content in requested language
  const [requestedContent] = await db
    .select({
      title: postContent.title,
      excerpt: postContent.excerpt,
      content: postContent.content,
      lang: postContent.lang,
    })
    .from(postContent)
    .where(and(eq(postContent.postId, post.id), eq(postContent.lang, lang)))
    .limit(1)

  // If not found in requested language, try fallback
  let content = requestedContent
  let isFallback = false

  if (!content && lang !== DEFAULT_LANG) {
    const [fallbackContentResult] = await db
      .select({
        title: postContent.title,
        excerpt: postContent.excerpt,
        content: postContent.content,
        lang: postContent.lang,
      })
      .from(postContent)
      .where(and(eq(postContent.postId, post.id), eq(postContent.lang, DEFAULT_LANG)))
      .limit(1)

    content = fallbackContentResult
    isFallback = true
  }

  // If no content at all, post is incomplete
  if (!content) {
    throw Errors.notFound('Post content not available')
  }

  // Get all available languages for this post (for language switcher UI)
  const availableLangsResult = await db
    .select({ lang: postContent.lang })
    .from(postContent)
    .where(eq(postContent.postId, post.id))

  const availableLanguages = availableLangsResult.map((r) => r.lang)

  return {
    id: post.id,
    slug: post.slug,
    bannerUrl: post.bannerUrl,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    // Content
    title: content.title,
    excerpt: content.excerpt,
    content: content.content,
    // Language info
    lang: content.lang,
    isFallback,
    availableLanguages,
  }
})
