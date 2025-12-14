/**
 * Translation Library
 *
 * Provides translation services using DeepL (primary) or Grok/X.AI (fallback).
 *
 * Configuration:
 * - DEEPL_API_KEY: DeepL API key (preferred provider)
 * - XAI_API_KEY: X.AI API key (fallback provider using Grok)
 *
 * @example
 * import { translateContent, isTranslationConfigured } from '../../lib/translate'
 *
 * if (isTranslationConfigured()) {
 *   const result = await translateContent(
 *     { title: 'Hello', description: 'Welcome' },
 *     ['es', 'de', 'fr']
 *   )
 *   console.log(result.translations.es.title) // 'Hola'
 * }
 */

// Types
export type {
  ProviderResult,
  SupportedLanguage,
  TargetLanguage,
  TranslateContentFields,
  TranslateRequest,
  TranslateResponse,
  TranslationProvider,
  TranslationProviderInterface,
} from './types'

// Constants
export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, TARGET_LANGUAGES } from './types'

// Service
export { getConfiguredProviderName, isTranslationConfigured, translateContent } from './service'

// Providers (for direct use if needed)
export { deeplProvider } from './deepl'
export { groqProvider } from './groq'
