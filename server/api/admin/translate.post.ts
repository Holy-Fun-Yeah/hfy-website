/**
 * POST /api/admin/translate
 *
 * Translate content from English to multiple languages.
 * Admin-only endpoint.
 *
 * Uses DeepL (primary) or Groq with Meta Maverick (fallback).
 *
 * Request Body:
 * {
 *   "sourceLang": "en",  // Always 'en' for this project
 *   "targetLangs": ["es", "de", "fr"],  // Optional, defaults to all
 *   "content": {
 *     "title": "Hello World",
 *     "description": "Welcome to our site",
 *     "paragraphs": ["First paragraph", "Second paragraph"]
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "provider": "deepl",
 *     "translations": {
 *       "es": { "title": "Hola Mundo", ... },
 *       "de": { "title": "Hallo Welt", ... },
 *       "fr": { "title": "Bonjour le monde", ... }
 *     },
 *     "errors": []  // Only present if some translations failed
 *   }
 * }
 */

import { z } from 'zod'

import { defineApiHandler, Errors } from '../../lib'
import {
  isTranslationConfigured,
  translateContent,
  type TargetLanguage,
  type TranslateContentFields,
} from '../../lib/translate'
import { requireAdmin } from '../../utils/auth'

// Request validation schema
const translateRequestSchema = z.object({
  sourceLang: z.literal('en'),
  targetLangs: z
    .array(z.enum(['es', 'de', 'fr']))
    .min(1)
    .optional()
    .default(['es', 'de', 'fr']),
  content: z.record(z.union([z.string(), z.array(z.string())])),
})

export default defineApiHandler(async (event) => {
  // Require admin access
  await requireAdmin(event)

  // Check if translation is configured
  if (!isTranslationConfigured()) {
    throw Errors.serviceUnavailable(
      'Translation service not configured. Set DEEPL_API_KEY or GROQ_API_KEY.'
    )
  }

  // Parse and validate request body
  const body = await readBody(event)
  const parsed = translateRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { targetLangs, content } = parsed.data

  // Validate content is not empty
  if (Object.keys(content).length === 0) {
    throw Errors.badRequest('Content to translate cannot be empty')
  }

  // Validate all content values are non-empty
  for (const [key, value] of Object.entries(content)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw Errors.badRequest(`Content field "${key}" cannot be an empty array`)
      }
    } else if (typeof value === 'string') {
      if (value.trim().length === 0) {
        throw Errors.badRequest(`Content field "${key}" cannot be empty`)
      }
    }
  }

  // Translate content
  const result = await translateContent(
    content as TranslateContentFields,
    targetLangs as TargetLanguage[]
  )

  // Check if all translations failed
  if (result.errors && result.errors.length === targetLangs.length) {
    throw Errors.internal(
      `Translation failed for all languages: ${result.errors.map((e) => e.message).join(', ')}`
    )
  }

  return result
})
