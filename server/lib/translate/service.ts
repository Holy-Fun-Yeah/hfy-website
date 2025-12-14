/**
 * Translation Service
 *
 * Main translation orchestrator with fallback logic.
 * Tries DeepL first (higher quality), falls back to Grok if unavailable.
 *
 * Usage:
 *   import { translateContent } from './service'
 *   const result = await translateContent(englishContent, ['es', 'de', 'fr'])
 */

import { deeplProvider } from './deepl'
import { groqProvider } from './groq'
import type {
  ProviderResult,
  TargetLanguage,
  TranslateContentFields,
  TranslateResponse,
  TranslationProvider,
  TranslationProviderInterface,
} from './types'
import { TARGET_LANGUAGES } from './types'

/**
 * Ordered list of providers (first available wins)
 * DeepL is preferred for quality, Grok as fallback
 */
const PROVIDERS: TranslationProviderInterface[] = [deeplProvider, groqProvider]

/**
 * Get the first configured provider
 */
function getAvailableProvider(): TranslationProviderInterface | null {
  for (const provider of PROVIDERS) {
    if (provider.isConfigured()) {
      return provider
    }
  }
  return null
}

/**
 * Translate content to a single target language using available provider
 */
async function translateToLanguage(
  content: TranslateContentFields,
  targetLang: TargetLanguage,
  provider: TranslationProviderInterface
): Promise<{ lang: TargetLanguage; result: ProviderResult }> {
  const result = await provider.translate(content, targetLang)
  return { lang: targetLang, result }
}

/**
 * Translate content to multiple languages
 *
 * @param content - Content fields to translate (string or string[])
 * @param targetLangs - Target languages (defaults to all: es, de, fr)
 * @returns Translation response with all translations
 */
export async function translateContent(
  content: TranslateContentFields,
  targetLangs: TargetLanguage[] = TARGET_LANGUAGES
): Promise<TranslateResponse> {
  const provider = getAvailableProvider()

  // No provider available - return empty translations with error
  if (!provider) {
    return {
      provider: 'manual',
      translations: {
        es: {},
        de: {},
        fr: {},
      },
      errors: [
        {
          lang: 'en',
          message: 'No translation provider configured. Set DEEPL_API_KEY or XAI_API_KEY.',
        },
      ],
    }
  }

  // Translate to all requested languages in parallel
  const translationPromises = targetLangs.map((lang) =>
    translateToLanguage(content, lang, provider)
  )

  const results = await Promise.all(translationPromises)

  // Build response
  const response: TranslateResponse = {
    provider: provider.name,
    translations: {
      es: {},
      de: {},
      fr: {},
    },
    errors: [],
  }

  for (const { lang, result } of results) {
    if (result.success && result.content) {
      response.translations[lang] = result.content
    } else {
      response.errors = response.errors || []
      response.errors.push({
        lang,
        message: result.error || `Failed to translate to ${lang}`,
      })
      // Keep empty object for failed translation
      response.translations[lang] = {}
    }
  }

  // Remove errors array if empty
  if (response.errors?.length === 0) {
    delete response.errors
  }

  return response
}

/**
 * Check if any translation provider is configured
 */
export function isTranslationConfigured(): boolean {
  return getAvailableProvider() !== null
}

/**
 * Get the name of the configured provider
 */
export function getConfiguredProviderName(): TranslationProvider | null {
  const provider = getAvailableProvider()
  return provider?.name ?? null
}
