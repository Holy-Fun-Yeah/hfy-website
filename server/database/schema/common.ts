import { pgEnum } from 'drizzle-orm/pg-core'

// ============================================================
// Language Enum (for multilingual content tables)
// ============================================================
export const supportedLanguages = ['en', 'es', 'de', 'fr'] as const
export const langEnum = pgEnum('lang', supportedLanguages)
export type SupportedLanguage = (typeof supportedLanguages)[number]
