/**
 * Groq Translation Provider
 *
 * Uses Groq API with Meta's Maverick model for fast translations.
 * Requires GROQ_API_KEY environment variable.
 *
 * Groq provides ultra-fast inference with their LPU hardware.
 * Docs: https://console.groq.com/docs
 */

import type {
  ProviderResult,
  TargetLanguage,
  TranslateContentFields,
  TranslationProviderInterface,
} from './types'
import { LANGUAGE_LABELS } from './types'

// Groq API endpoint (OpenAI-compatible)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Model to use - Meta's Maverick (fast and capable)
const GROQ_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct'

/**
 * Get Groq API key from environment
 */
function getApiKey(): string | undefined {
  return process.env.GROQ_API_KEY
}

/**
 * Build the translation prompt
 */
function buildPrompt(content: TranslateContentFields, targetLang: TargetLanguage): string {
  const langName = LANGUAGE_LABELS[targetLang]

  return `You are a professional translator. Translate the following JSON content from English to ${langName}.

IMPORTANT RULES:
1. Return ONLY valid JSON with the exact same structure as the input
2. Preserve all keys exactly as they are
3. Only translate the string values
4. For arrays, translate each element while maintaining the array structure
5. Do not add any explanation or markdown formatting
6. Maintain the same tone and formality level

INPUT JSON:
${JSON.stringify(content, null, 2)}

OUTPUT (${langName} translation as valid JSON):`
}

/**
 * Parse the response to extract translated content
 */
function parseResponse(response: string): TranslateContentFields {
  // Try to extract JSON from the response
  // Model might include markdown code blocks
  let jsonStr = response.trim()

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7)
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3)
  }

  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3)
  }

  jsonStr = jsonStr.trim()

  return JSON.parse(jsonStr) as TranslateContentFields
}

/**
 * Translate content using Groq
 */
async function translateWithGroq(
  content: TranslateContentFields,
  targetLang: TargetLanguage,
  apiKey: string
): Promise<TranslateContentFields> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: buildPrompt(content, targetLang),
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const responseContent = data.choices?.[0]?.message?.content

  if (!responseContent) {
    throw new Error('Invalid Groq response format')
  }

  return parseResponse(responseContent)
}

/**
 * Groq Translation Provider
 */
export const groqProvider: TranslationProviderInterface = {
  name: 'grok', // Keep 'grok' for contract compatibility

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
        error: 'Groq API key not configured',
      }
    }

    try {
      const translated = await translateWithGroq(content, targetLang, apiKey)

      // Validate that we got the same keys back
      const inputKeys = Object.keys(content).sort()
      const outputKeys = Object.keys(translated).sort()

      if (JSON.stringify(inputKeys) !== JSON.stringify(outputKeys)) {
        throw new Error('Translation response has different keys than input')
      }

      return {
        success: true,
        content: translated,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Groq translation failed',
      }
    }
  },
}
