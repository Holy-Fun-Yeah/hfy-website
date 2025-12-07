import { brandConfig } from '~/config/brand'
import type { BrandPalette, BrandTypography } from '~/types/brand'

/**
 * Inject brand values as CSS custom properties on :root
 *
 * This bridges the config → Tailwind @theme → component flow:
 * 1. Config defines hex values for light/dark
 * 2. useTheme determines current mode
 * 3. This function sets --brand-* CSS vars for active palette
 * 4. Components use Tailwind classes (bg-brand-accent)
 */
function injectBrandCSS(palette: BrandPalette, typography: BrandTypography) {
  if (!import.meta.client) return

  const root = document.documentElement

  // Inject color variables
  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--brand-${key}`, value)
  })

  // Inject font variables
  Object.entries(typography).forEach(([key, value]) => {
    root.style.setProperty(`--brand-font-${key}`, value)
  })
}

/**
 * Brand management composable
 *
 * Provides reactive access to brand configuration with automatic theme support.
 * CSS variables are automatically updated when theme changes.
 * Auto-imported in Nuxt - no import needed.
 *
 * @example
 * ```vue
 * <script setup>
 * const { brand, palette } = useBrand()
 * </script>
 *
 * <template>
 *   <h1 class="font-logo text-brand-accent">{{ brand.name }}</h1>
 * </template>
 * ```
 */
export function useBrand() {
  const { themeMode } = useTheme()

  /** Current palette based on theme */
  const palette = computed(() =>
    themeMode.value === 'dark' ? brandConfig.dark : brandConfig.light
  )

  /** Typography (same for both themes) */
  const typography = computed(() => brandConfig.typography)

  /** Brand info */
  const brand = computed(() => ({
    name: brandConfig.name,
    tagline: brandConfig.tagline,
    palette: palette.value,
    typography: typography.value,
  }))

  // Inject CSS variables whenever theme changes
  watch(
    [palette, typography],
    ([newPalette, newTypography]) => {
      injectBrandCSS(newPalette, newTypography)
    },
    { immediate: true }
  )

  // Also inject on client mount to ensure CSS vars are set
  onMounted(() => {
    injectBrandCSS(palette.value, typography.value)
  })

  return {
    /** Full brand config with current palette */
    brand,
    /** Current theme palette */
    palette,
    /** Typography settings */
    typography,
  }
}
