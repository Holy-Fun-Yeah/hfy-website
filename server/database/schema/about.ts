import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { langEnum, supportedLanguages } from './common'

// ============================================================
// About Settings Table (singleton - language-agnostic fields)
// ============================================================
// This is a single-row table for global about page settings.
// Only one row should exist (enforced at application level).
export const aboutSettings = pgTable('about_settings', {
  id: serial('id').primaryKey(),
  // Admin display name (used in quotes and elsewhere)
  adminName: text('admin_name').notNull(),
  // Vision section image URL (same across all languages)
  visionImageUrl: text('vision_image_url'),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================
// About Content Table (translatable fields per language)
// ============================================================
export const aboutContent = pgTable(
  'about_content',
  {
    id: serial('id').primaryKey(),
    lang: langEnum('lang').notNull(),
    // Main about section
    title: text('title').notNull(),
    description: text('description').notNull(),
    // Hero section
    heroTitle: text('hero_title').notNull(),
    heroSubtitle: text('hero_subtitle').notNull(),
    // Vision section
    visionTitle: text('vision_title').notNull(),
    // Stored as JSON array of strings
    visionParagraphs: text('vision_paragraphs').notNull(), // JSON array
    // Values section (v0, v1, v2)
    valuesV0Title: text('values_v0_title').notNull(),
    valuesV0Message: text('values_v0_message').notNull(),
    valuesV1Title: text('values_v1_title').notNull(),
    valuesV1Message: text('values_v1_message').notNull(),
    valuesV2Title: text('values_v2_title').notNull(),
    valuesV2Message: text('values_v2_message').notNull(),
    // Quote section
    quoteText: text('quote_text').notNull(),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // One row per language (singleton per lang)
    uniqueIndex('about_content_lang_idx').on(table.lang),
  ]
)

// ============================================================
// Zod Schemas
// ============================================================

// About settings schemas
export const selectAboutSettingsSchema = createSelectSchema(aboutSettings)
export const insertAboutSettingsSchema = createInsertSchema(aboutSettings, {
  adminName: z.string().min(1, 'Admin name is required').max(100),
  visionImageUrl: z.string().url().optional().nullable(),
})

export const updateAboutSettingsSchema = insertAboutSettingsSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// About content schemas
export const selectAboutContentSchema = createSelectSchema(aboutContent)
export const insertAboutContentSchema = createInsertSchema(aboutContent, {
  lang: z.enum(supportedLanguages),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  heroTitle: z.string().min(1, 'Hero title is required').max(200),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required').max(500),
  visionTitle: z.string().min(1, 'Vision title is required').max(200),
  visionParagraphs: z.string().min(1, 'Vision paragraphs are required'), // JSON string
  valuesV0Title: z.string().min(1).max(100),
  valuesV0Message: z.string().min(1).max(500),
  valuesV1Title: z.string().min(1).max(100),
  valuesV1Message: z.string().min(1).max(500),
  valuesV2Title: z.string().min(1).max(100),
  valuesV2Message: z.string().min(1).max(500),
  quoteText: z.string().min(1, 'Quote text is required').max(1000),
})

export const updateAboutContentSchema = insertAboutContentSchema.partial().omit({
  id: true,
  lang: true,
  createdAt: true,
  updatedAt: true,
})

// ============================================================
// Types
// ============================================================
export type AboutSettings = z.infer<typeof selectAboutSettingsSchema>
export type NewAboutSettings = z.infer<typeof insertAboutSettingsSchema>
export type UpdateAboutSettings = z.infer<typeof updateAboutSettingsSchema>
export type AboutContent = z.infer<typeof selectAboutContentSchema>
export type NewAboutContent = z.infer<typeof insertAboutContentSchema>
export type UpdateAboutContent = z.infer<typeof updateAboutContentSchema>

// Combined about page data (for API responses)
export type AboutPageData = AboutSettings & {
  content: AboutContent
}
