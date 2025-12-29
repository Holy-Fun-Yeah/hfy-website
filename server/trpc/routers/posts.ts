/**
 * Posts tRPC Router
 *
 * Provides type-safe API for blog posts with caching.
 */

import { and, count, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { posts, profiles, supportedLanguages } from '../../database/schema'
import { createPaginationInfo } from '../../lib'
import { publicProcedure, router } from '../trpc'

const DEFAULT_LANG = 'en'

// Input schemas
const listPostsInput = z.object({
  lang: z.enum(supportedLanguages).default('en'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

const getPostInput = z.object({
  slug: z.string().min(1),
  lang: z.enum(supportedLanguages).default('en'),
})

export const postsRouter = router({
  /**
   * List published blog posts with pagination and multilingual support.
   */
  list: publicProcedure.input(listPostsInput).query(async ({ ctx, input }) => {
    const { lang, page, limit } = input
    const { db } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    const offset = (page - 1) * limit

    // Query with fallback logic using COALESCE subqueries
    const result = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        bannerUrl: posts.bannerUrl,
        publishedAt: posts.createdAt,
        author: {
          id: profiles.id,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
        title: sql<string>`COALESCE(
          (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('title'),
        excerpt: sql<string>`COALESCE(
          (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('excerpt'),
        lang: sql<string>`COALESCE(
          (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('content_lang'),
        isFallback: sql<boolean>`NOT EXISTS (
          SELECT 1 FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}
        )`.as('is_fallback'),
      })
      .from(posts)
      .leftJoin(profiles, eq(profiles.id, posts.authorId))
      .where(
        and(
          eq(posts.published, true),
          sql`EXISTS (SELECT 1 FROM post_content WHERE post_id = ${posts.id})`
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)

    // Count total
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

    return {
      data: result.map((row) => ({
        id: row.id,
        slug: row.slug,
        bannerUrl: row.bannerUrl,
        publishedAt: row.publishedAt,
        author: row.author,
        title: row.title,
        excerpt: row.excerpt,
        lang: row.lang,
        isFallback: row.isFallback,
      })),
      pagination,
    }
  }),

  /**
   * Get a single post by slug with full content.
   */
  bySlug: publicProcedure.input(getPostInput).query(async ({ ctx, input }) => {
    const { slug, lang } = input
    const { db } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    const result = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        bannerUrl: posts.bannerUrl,
        publishedAt: posts.createdAt,
        author: {
          id: profiles.id,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
        title: sql<string>`COALESCE(
          (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT title FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('title'),
        excerpt: sql<string>`COALESCE(
          (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT excerpt FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('excerpt'),
        bodyMarkdown: sql<string>`COALESCE(
          (SELECT body_markdown FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT body_markdown FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('body_markdown'),
        lang: sql<string>`COALESCE(
          (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}),
          (SELECT lang FROM post_content WHERE post_id = ${posts.id} AND lang = ${DEFAULT_LANG})
        )`.as('content_lang'),
        isFallback: sql<boolean>`NOT EXISTS (
          SELECT 1 FROM post_content WHERE post_id = ${posts.id} AND lang = ${lang}
        )`.as('is_fallback'),
      })
      .from(posts)
      .leftJoin(profiles, eq(profiles.id, posts.authorId))
      .where(and(eq(posts.slug, slug), eq(posts.published, true)))
      .limit(1)

    if (!result[0]) {
      return null
    }

    return {
      id: result[0].id,
      slug: result[0].slug,
      bannerUrl: result[0].bannerUrl,
      publishedAt: result[0].publishedAt,
      author: result[0].author,
      title: result[0].title,
      excerpt: result[0].excerpt,
      bodyMarkdown: result[0].bodyMarkdown,
      lang: result[0].lang,
      isFallback: result[0].isFallback,
    }
  }),
})
