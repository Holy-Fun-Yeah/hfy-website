/**
 * GET /api/posts
 *
 * List published blog posts with pagination and multilingual support.
 *
 * Query params:
 * - lang: Language code (en, es, de, fr) - defaults to 'en'
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 *
 * Response includes:
 * - Post metadata (slug, bannerUrl, publishedAt)
 * - Author info (displayName, avatarUrl)
 * - Translated content (title, excerpt) in requested language
 * - isFallback: true if content fell back to English
 *
 * Uses LEFT JOIN with COALESCE for language fallback:
 * 1. Try to get content in requested language
 * 2. Fall back to English if not available
 */

import { and, count, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { posts, profiles, supportedLanguages } from '../../database/schema'
import { createPaginationInfo, definePaginatedApiHandler, Errors } from '../../lib'
import { paginationSchema } from '../../utils/validation'

// Query schema with language support
const postsQuerySchema = paginationSchema.extend({
  lang: z.enum(supportedLanguages).default('en'),
})

// Default language for fallback
const DEFAULT_LANG = 'en'

export default definePaginatedApiHandler(async (event) => {
  const { page, limit, lang } = postsQuerySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  const offset = (page - 1) * limit

  // For fallback strategy, we need to:
  // 1. LEFT JOIN content in requested language
  // 2. LEFT JOIN content in default language (for fallback)
  // 3. Use COALESCE to prefer requested lang, fall back to default

  // Build the query with fallback logic
  // We use a subquery approach for cleaner fallback handling
  const result = await db
    .select({
      // Post fields
      id: posts.id,
      slug: posts.slug,
      bannerUrl: posts.bannerUrl,
      publishedAt: posts.createdAt,
      // Author fields
      author: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      // Content fields (from requested language or fallback)
      title: sql<string>`COALESCE(
        (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
        (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
      )`.as('title'),
      excerpt: sql<string>`COALESCE(
        (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
        (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
      )`.as('excerpt'),
      // Language info
      lang: sql<string>`COALESCE(
        (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
        (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
      )`.as('content_lang'),
      // Fallback indicator
      isFallback: sql<boolean>`NOT EXISTS (
        SELECT 1 FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}
      )`.as('is_fallback'),
    })
    .from(posts)
    .leftJoin(profiles, eq(profiles.id, posts.authorId))
    .where(
      and(
        eq(posts.published, true),
        // Exclude posts with no content at all (not even in default language)
        sql`EXISTS (SELECT 1 FROM post_content WHERE post_id = ${posts.id})`
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset)

  // Count total published posts (that have at least some content)
  const countResult = await db
    .select({ total: count() })
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        sql`EXISTS (SELECT 1 FROM post_content WHERE post_id = ${posts.id})`
      )
    )

  const total = countResult[0]?.total ?? 0
  const pagination = createPaginationInfo(total, page, limit)

  // Transform result to match expected shape
  const postsWithContent = result.map((row) => ({
    id: row.id,
    slug: row.slug,
    bannerUrl: row.bannerUrl,
    publishedAt: row.publishedAt,
    author: row.author,
    title: row.title,
    excerpt: row.excerpt,
    lang: row.lang,
    isFallback: row.isFallback,
  }))

  return [postsWithContent, pagination]
})
