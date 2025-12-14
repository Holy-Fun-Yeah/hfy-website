/**
 * DeepL Translation Provider
 *
 * Uses DeepL API for high-quality translations.
 * Requires DEEPL_API_KEY environment variable.
 *
 * DeepL API docs: https://www.deepl.com/docs-api
 */

import type {
  ProviderResult,
  TargetLanguage,
  TranslateContentFields,
  TranslationProviderInterface,
} from './types'

// DeepL uses uppercase language codes
const DEEPL_LANG_MAP: Record<TargetLanguage, string> = {
  es: 'ES',
  de: 'DE',
  fr: 'FR',
}

// DeepL API endpoint
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

/**
 * Get DeepL API key from environment
 */
function getApiKey(): string | undefined {
  return process.env.DEEPL_API_KEY
}

/**
 * Translate a single text using DeepL API
 */
async function translateText(
  text: string,
  targetLang: TargetLanguage,
  apiKey: string
): Promise<string> {
  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: 'EN',
      target_lang: DEEPL_LANG_MAP[targetLang],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepL API error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as { translations: Array<{ text: string }> }

  if (!data.translations?.[0]?.text) {
    throw new Error('Invalid DeepL response format')
  }

  return data.translations[0].text
}

/**
 * DeepL Translation Provider
 */
export const deeplProvider: TranslationProviderInterface = {
  name: 'deepl',

  isConfigured(): boolean {
    return Boolean(getApiKey())
  },

  async translate(
    content: TranslateContentFields,
    targetLang: TargetLanguage
  ): Promise<ProviderResult> {
    const apiKey = getApiKey()

    if (!apiKey) {
      return {
        success: false,
        error: 'DeepL API key not configured',
      }
    }

    try {
      const translated: TranslateContentFields = {}

      for (const [key, value] of Object.entries(content)) {
        if (Array.isArray(value)) {
          // Translate array of strings (e.g., paragraphs)
          const translatedArray: string[] = []
          for (const item of value) {
            if (item.trim()) {
              translatedArray.push(await translateText(item, targetLang, apiKey))
            } else {
              translatedArray.push(item) // Preserve empty strings
            }
          }
          translated[key] = translatedArray
        } else if (typeof value === 'string') {
          // Translate single string
          if (value.trim()) {
            translated[key] = await translateText(value, targetLang, apiKey)
          } else {
            translated[key] = value // Preserve empty strings
          }
        }
      }

      return {
        success: true,
        content: translated,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DeepL translation failed',
      }
    }
  },
}
