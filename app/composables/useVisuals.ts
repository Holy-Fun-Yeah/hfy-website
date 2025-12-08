import {
  visualConfig,
  getRainbowArray,
  getRainbowAnimationValues,
  getRainbowStops,
  getGoldStops,
  getOrbColors,
  getParticleColors,
  getStarGradient,
  getStarGlow,
  type VisualColors,
} from '~/config/visuals'

/**
 * Composable for theme-aware visual colors
 *
 * Provides access to rainbow, gold, and accent colors that automatically
 * adapt to the current light/dark theme.
 *
 * @example
 * ```ts
 * const { colors, rainbow, rainbowStops, orbColors, starGradient } = useVisuals()
 *
 * // Direct color access
 * const redColor = colors.value.rainbow.red
 *
 * // Pre-computed arrays for gradients
 * const stops = rainbowStops.value // [{ offset, color }, ...]
 * ```
 */
export function useVisuals() {
  const { isDark } = useTheme()

  /** Current theme's visual colors */
  const colors = computed<VisualColors>(() =>
    isDark.value ? visualConfig.dark : visualConfig.light
  )

  /** Rainbow colors as ordered array [red, orange, yellow, green, blue, purple] */
  const rainbow = computed(() => getRainbowArray(colors.value))

  /** Rainbow animation values for SVG SMIL (semicolon-separated, loops back) */
  const rainbowAnimationValues = computed(() => getRainbowAnimationValues(colors.value))

  /** Rainbow gradient stops with offsets for SVG linearGradient */
  const rainbowStops = computed(() => getRainbowStops(colors.value))

  /** Gold gradient stops for sacred geometry, stars */
  const goldStops = computed(() => getGoldStops(colors.value))

  /** Orb colors for AmbientBackground (from/to rgba pairs) */
  const orbColors = computed(() => getOrbColors(colors.value))

  /** Particle colors for shimmer effect */
  const particleColors = computed(() => getParticleColors(colors.value))

  /** CSS gradient for star shapes */
  const starGradient = computed(() => getStarGradient(colors.value))

  /** CSS filter for star glow effect */
  const starGlow = computed(() => getStarGlow(colors.value))

  /**
   * Generate shifted rainbow animation values for SMIL
   * Each index starts at a different point in the rainbow cycle
   * @param index - Position in the gradient (0-5)
   */
  const getShiftedRainbowValues = (index: number) => {
    const arr = rainbow.value
    const shifted = [...arr.slice(index), ...arr.slice(0, index)]
    return shifted.join(';') + ';' + shifted[0]
  }

  return {
    // Core colors
    colors,
    rainbow,

    // Pre-computed for SVG gradients
    rainbowStops,
    goldStops,
    rainbowAnimationValues,
    getShiftedRainbowValues,

    // Pre-computed for AmbientBackground
    orbColors,
    particleColors,
    starGradient,
    starGlow,
  }
}
