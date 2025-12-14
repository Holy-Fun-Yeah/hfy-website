/**
 * Translation Types
 *
 * Types for the translation API.
 * These match the contracts defined in .octopus/contracts/types.ts
 *
 * TODO: When brain commits contracts to git, refactor to import from there
 */

/**
 * Supported languages for content translation
 */
export type SupportedLanguage = 'en' | 'es' | 'de' | 'fr'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es', 'de', 'fr']

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
}

/**
 * Target languages (excluding English source)
 */
export type TargetLanguage = Exclude<SupportedLanguage, 'en'>

export const TARGET_LANGUAGES: TargetLanguage[] = ['es', 'de', 'fr']

/**
 * Translation API provider
 */
export type TranslationProvider = 'deepl' | 'grok' | 'manual'

/**
 * Content fields that can be translated
 * Supports both simple strings and arrays (for paragraphs)
 */
export interface TranslateContentFields {
  [key: string]: string | string[]
}

/**
 * Request to translate content
 */
export interface TranslateRequest {
  /** Source language (always 'en' for this project) */
  sourceLang: 'en'
  /** Target languages to translate to */
  targetLangs: TargetLanguage[]
  /** Content fields to translate */
  content: TranslateContentFields
}

/**
 * Translation response
 */
export interface TranslateResponse {
  /** Provider used for translation */
  provider: TranslationProvider
  /** Translations by language */
  translations: {
    es: TranslateContentFields
    de: TranslateContentFields
    fr: TranslateContentFields
  }
  /** Any errors encountered */
  errors?: {
    lang: SupportedLanguage
    message: string
  }[]
}

/**
 * Internal provider result (for individual language translation)
 */
export interface ProviderResult {
  success: boolean
  content?: TranslateContentFields
  error?: string
}

/**
 * Provider interface that DeepL and Grok must implement
 */
export interface TranslationProviderInterface {
  name: TranslationProvider
  isConfigured(): boolean
  translate(content: TranslateContentFields, targetLang: TargetLanguage): Promise<ProviderResult>
}
