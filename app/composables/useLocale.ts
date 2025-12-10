/**
 * Locale Composable
 *
 * Wraps nuxt-i18n-micro functionality with our locale metadata (flags, names).
 * Provides type-safe access to locale switching and translation.
 */

import { SUPPORTED_LOCALES, type LocaleCode, type LocaleInfo } from '~/types/locale'

export function useLocale() {
  const { $getLocale, $switchLocale, $getLocales, $t } = useNuxtApp()

  // Current locale code
  const currentLocale = computed<LocaleCode>(() => {
    const code = $getLocale() as string
    return (code || 'en') as LocaleCode
  })

  // Current locale info with flag
  const currentLocaleInfo = computed<LocaleInfo>(() => {
    return SUPPORTED_LOCALES.find((l) => l.code === currentLocale.value) || SUPPORTED_LOCALES[0]!
  })

  // All available locales from config
  const availableLocales = computed(() => {
    const configuredLocales = $getLocales() as Array<{ code: string; iso?: string; name?: string }>
    return configuredLocales.map((locale) => {
      const info = SUPPORTED_LOCALES.find((l) => l.code === locale.code)
      return {
        code: locale.code as LocaleCode,
        iso: locale.iso || info?.iso || locale.code,
        name: locale.name || info?.name || locale.code,
        flag: info?.flag || '🌐',
      }
    })
  })

  // Switch locale
  function switchLocale(code: LocaleCode) {
    $switchLocale(code)
  }

  // Translate helper (passthrough to $t)
  function t(key: string, params?: Record<string, string | number | boolean>): string {
    return $t(key, params) as string
  }

  return {
    currentLocale,
    currentLocaleInfo,
    availableLocales,
    switchLocale,
    t,
  }
}
