/**
 * useScrollGradient - Creates scroll-based color transitions
 *
 * Shifts brand gradient colors as user scrolls through the page,
 * creating an ethereal, ever-changing color atmosphere.
 *
 * @example
 * ```ts
 * const { gradientStyle, scrollProgress } = useScrollGradient()
 * ```
 */

export function useScrollGradient() {
  const scrollProgress = ref(0)
  const isClient = import.meta.client

  // Rainbow color stops for scroll transitions (full spectrum)
  const colorStops = [
    { r: 219, g: 39, b: 119 }, // Pink #db2777
    { r: 124, g: 58, b: 237 }, // Violet #7c3aed
    { r: 8, g: 145, b: 178 }, // Cyan #0891b2
    { r: 34, g: 197, b: 94 }, // Green #22c55e
    { r: 250, g: 204, b: 21 }, // Yellow #facc15
    { r: 249, g: 115, b: 22 }, // Orange #f97316
    { r: 219, g: 39, b: 119 }, // Back to pink (loop)
  ]

  // Interpolate between two colors
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const lerpColor = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    t: number
  ) => ({
    r: Math.round(lerp(color1.r, color2.r, t)),
    g: Math.round(lerp(color1.g, color2.g, t)),
    b: Math.round(lerp(color1.b, color2.b, t)),
  })

  // Get color at any point along the gradient spectrum (0-1)
  const getColorAtProgress = (progress: number) => {
    const totalSegments = colorStops.length - 1
    const segment = progress * totalSegments
    const index = Math.min(Math.floor(segment), totalSegments - 1)
    const localT = segment - index

    const color1 = colorStops[index] ?? colorStops[0]!
    const color2 = colorStops[index + 1] ?? colorStops[0]!
    return lerpColor(color1, color2, localT)
  }

  // Current gradient colors based on scroll
  const currentColors = computed(() => {
    // Offset each color stop for gradient effect
    const start = getColorAtProgress(scrollProgress.value % 1)
    const middle = getColorAtProgress((scrollProgress.value + 0.33) % 1)
    const end = getColorAtProgress((scrollProgress.value + 0.66) % 1)

    return {
      start: `rgb(${start.r}, ${start.g}, ${start.b})`,
      middle: `rgb(${middle.r}, ${middle.g}, ${middle.b})`,
      end: `rgb(${end.r}, ${end.g}, ${end.b})`,
    }
  })

  // CSS custom properties for gradient
  const gradientStyle = computed(() => ({
    '--scroll-gradient-start': currentColors.value.start,
    '--scroll-gradient-middle': currentColors.value.middle,
    '--scroll-gradient-end': currentColors.value.end,
  }))

  // Full gradient string
  const gradientValue = computed(
    () =>
      `linear-gradient(135deg, ${currentColors.value.start}, ${currentColors.value.middle}, ${currentColors.value.end})`
  )

  // Update scroll progress on scroll
  const updateScrollProgress = () => {
    if (!isClient) return

    const scrollTop = window.scrollY

    // Map scroll to 0-1 (can exceed 1 for multiple color cycles)
    // Slower cycle: complete one color cycle per 3000px of scroll
    scrollProgress.value = scrollTop / 3000
  }

  // Throttled scroll handler
  let ticking = false
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress()
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => {
    if (isClient) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      updateScrollProgress()
    }
  })

  onUnmounted(() => {
    if (isClient) {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    scrollProgress: readonly(scrollProgress),
    currentColors,
    gradientStyle,
    gradientValue,
  }
}
