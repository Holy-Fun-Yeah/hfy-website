/**
 * PUT /api/admin/about
 *
 * Update the about page content.
 * Admin-only endpoint.
 *
 * Since about is a singleton:
 * - Creates settings if none exist
 * - Updates settings if they exist
 * - Upserts content for all 4 languages
 *
 * Request body must include content for ALL supported languages.
 * Frontend is responsible for translations before submission.
 *
 * Uses database transaction for atomicity.
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import {
  aboutContent,
  aboutSettings,
  supportedLanguages,
  type SupportedLanguage,
} from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'
import { requireAdmin } from '../../utils/auth'

// Content schema for a single language
const langContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  heroTitle: z.string().min(1, 'Hero title is required').max(200),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required').max(500),
  visionTitle: z.string().min(1, 'Vision title is required').max(200),
  visionParagraphs: z.array(z.string().min(1)).min(1, 'At least one paragraph required'),
  valuesV0Title: z.string().min(1).max(100),
  valuesV0Message: z.string().min(1).max(500),
  valuesV1Title: z.string().min(1).max(100),
  valuesV1Message: z.string().min(1).max(500),
  valuesV2Title: z.string().min(1).max(100),
  valuesV2Message: z.string().min(1).max(500),
  quoteText: z.string().min(1, 'Quote text is required').max(1000),
})

// Build content schema requiring all supported languages
const contentSchema = z.object(
  Object.fromEntries(supportedLanguages.map((lang) => [lang, langContentSchema])) as {
    [K in (typeof supportedLanguages)[number]]: typeof langContentSchema
  }
)

// Main request schema
const updateAboutSchema = z.object({
  // Settings (language-agnostic)
  adminName: z.string().min(1, 'Admin name is required').max(100),
  visionImageUrl: z.string().url().optional().nullable(),
  // Content (per language)
  content: contentSchema,
})

export default defineApiHandler(async (event) => {
  // Require admin access
  await requireAdmin(event)

  // Validate request body
  const body = await readBody(event)
  const parsed = updateAboutSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }

  const { adminName, visionImageUrl, content } = parsed.data

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Execute upsert in a transaction
  const result = await db.transaction(async (tx) => {
    // Upsert settings
    const [existingSettings] = await tx.select({ id: aboutSettings.id }).from(aboutSettings).limit(1)

    let settingsId: number

    if (existingSettings) {
      // Update existing settings
      const [updated] = await tx
        .update(aboutSettings)
        .set({
          adminName,
          visionImageUrl: visionImageUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(aboutSettings.id, existingSettings.id))
        .returning()

      if (!updated) {
        throw Errors.internal('Failed to update settings')
      }

      settingsId = updated.id
    } else {
      // Create new settings
      const [created] = await tx
        .insert(aboutSettings)
        .values({
          adminName,
          visionImageUrl: visionImageUrl ?? null,
        })
        .returning()

      if (!created) {
        throw Errors.internal('Failed to create settings')
      }

      settingsId = created.id
    }

    // Upsert content for all languages
    const contentResults: Record<string, { title: string; isNew: boolean }> = {}

    for (const lang of supportedLanguages) {
      const langContent = content[lang]

      // Check if content exists for this language
      const [existingContent] = await tx
        .select({ id: aboutContent.id })
        .from(aboutContent)
        .where(eq(aboutContent.lang, lang))
        .limit(1)

      // Serialize paragraphs to JSON string
      const visionParagraphsJson = JSON.stringify(langContent.visionParagraphs)

      if (existingContent) {
        // Update existing
        await tx
          .update(aboutContent)
          .set({
            title: langContent.title,
            description: langContent.description,
            heroTitle: langContent.heroTitle,
            heroSubtitle: langContent.heroSubtitle,
            visionTitle: langContent.visionTitle,
            visionParagraphs: visionParagraphsJson,
            valuesV0Title: langContent.valuesV0Title,
            valuesV0Message: langContent.valuesV0Message,
            valuesV1Title: langContent.valuesV1Title,
            valuesV1Message: langContent.valuesV1Message,
            valuesV2Title: langContent.valuesV2Title,
            valuesV2Message: langContent.valuesV2Message,
            quoteText: langContent.quoteText,
            updatedAt: new Date(),
          })
          .where(eq(aboutContent.id, existingContent.id))

        contentResults[lang] = {
          title: langContent.title,
          isNew: false,
        }
      } else {
        // Insert new
        await tx.insert(aboutContent).values({
          lang: lang as SupportedLanguage,
          title: langContent.title,
          description: langContent.description,
          heroTitle: langContent.heroTitle,
          heroSubtitle: langContent.heroSubtitle,
          visionTitle: langContent.visionTitle,
          visionParagraphs: visionParagraphsJson,
          valuesV0Title: langContent.valuesV0Title,
          valuesV0Message: langContent.valuesV0Message,
          valuesV1Title: langContent.valuesV1Title,
          valuesV1Message: langContent.valuesV1Message,
          valuesV2Title: langContent.valuesV2Title,
          valuesV2Message: langContent.valuesV2Message,
          quoteText: langContent.quoteText,
        })

        contentResults[lang] = {
          title: langContent.title,
          isNew: true,
        }
      }
    }

    // Fetch the complete data
    const [finalSettings] = await tx
      .select()
      .from(aboutSettings)
      .where(eq(aboutSettings.id, settingsId))
      .limit(1)

    if (!finalSettings) {
      throw Errors.internal('Failed to fetch settings')
    }

    const finalContent = await tx.select().from(aboutContent)

    return {
      settings: finalSettings,
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
        description: c.description,
        heroTitle: c.heroTitle,
        heroSubtitle: c.heroSubtitle,
        visionTitle: c.visionTitle,
        visionParagraphs: JSON.parse(c.visionParagraphs),
        valuesV0Title: c.valuesV0Title,
        valuesV0Message: c.valuesV0Message,
        valuesV1Title: c.valuesV1Title,
        valuesV1Message: c.valuesV1Message,
        valuesV2Title: c.valuesV2Title,
        valuesV2Message: c.valuesV2Message,
        quoteText: c.quoteText,
        isNew: result.contentResults[c.lang]?.isNew ?? false,
      },
    ])
  )

  return {
    message: 'About page updated successfully',
    settings: {
      adminName: result.settings.adminName,
      visionImageUrl: result.settings.visionImageUrl,
      updatedAt: result.settings.updatedAt,
    },
    content: contentByLang,
  }
})
