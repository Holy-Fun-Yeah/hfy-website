/**
 * GET /api/about
 *
 * Get the about page content.
 * This is a singleton endpoint - there's only one about page.
 *
 * Query params:
 * - lang: Language code (en, es, de, fr) - defaults to 'en'
 *
 * Response includes:
 * - Settings (adminName, visionImageUrl) - language-agnostic
 * - Content in requested language (with fallback to English)
 * - isFallback: true if content fell back to English
 * - availableLanguages: array of languages with content
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../database'
import { aboutContent, aboutSettings, supportedLanguages } from '../database/schema'
import { defineApiHandler, Errors } from '../lib'

const querySchema = z.object({
  lang: z.enum(supportedLanguages).default('en'),
})

const DEFAULT_LANG = 'en'

export default defineApiHandler(async (event) => {
  const { lang } = querySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  // Get the singleton settings row
  const [settings] = await db.select().from(aboutSettings).limit(1)

  if (!settings) {
    throw Errors.notFound('About page not configured')
  }

  // Get content in requested language
  const [requestedContent] = await db
    .select()
    .from(aboutContent)
    .where(eq(aboutContent.lang, lang))
    .limit(1)

  // If not found, try fallback to English
  let content = requestedContent
  let isFallback = false

  if (!content && lang !== DEFAULT_LANG) {
    const [fallbackContent] = await db
      .select()
      .from(aboutContent)
      .where(eq(aboutContent.lang, DEFAULT_LANG))
      .limit(1)

    content = fallbackContent
    isFallback = true
  }

  if (!content) {
    throw Errors.notFound('About content not available')
  }

  // Get all available languages
  const availableLangsResult = await db.select({ lang: aboutContent.lang }).from(aboutContent)

  const availableLanguages = availableLangsResult.map((r) => r.lang)

  // Parse vision paragraphs from JSON string
  let visionParagraphs: string[] = []
  try {
    visionParagraphs = JSON.parse(content.visionParagraphs)
  } catch {
    visionParagraphs = [content.visionParagraphs]
  }

  return {
    // Settings (language-agnostic)
    adminName: settings.adminName,
    visionImageUrl: settings.visionImageUrl,
    // Content (translated)
    title: content.title,
    description: content.description,
    hero: {
      title: content.heroTitle,
      subtitle: content.heroSubtitle,
    },
    vision: {
      title: content.visionTitle,
      paragraphs: visionParagraphs,
    },
    values: {
      v0: { title: content.valuesV0Title, message: content.valuesV0Message },
      v1: { title: content.valuesV1Title, message: content.valuesV1Message },
      v2: { title: content.valuesV2Title, message: content.valuesV2Message },
    },
    quote: {
      text: content.quoteText,
      author: settings.adminName,
    },
    // Language info
    lang: content.lang,
    isFallback,
    availableLanguages,
  }
})
