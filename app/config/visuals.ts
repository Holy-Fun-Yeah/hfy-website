/**
 * Visual Effects Color Configuration
 *
 * Centralized color definitions for all decorative visual components.
 * Separate from brand config to keep brand focused on semantic UI colors.
 *
 * Components using these colors:
 * - AmbientBackground (orbs, particles, stars)
 * - EnergyThreads (rainbow gradient lines)
 * - RadialBurst (sunburst rays)
 * - SacredGeometry (gold gradients)
 *
 * @see ~/docs/STYLE_GUIDELINE.md for visual design principles
 */

export interface VisualColors {
  /** Pride rainbow spectrum - 6 colors of the pride flag */
  rainbow: {
    red: string
    orange: string
    yellow: string
    green: string
    blue: string
    purple: string
  }
  /** Gold/solar spectrum for stars, sacred geometry, accents */
  gold: {
    white: string
    light: string
    medium: string
    dark: string
  }
  /** Additional accent colors */
  accents: {
    violet: string // Darker purple for depth
    pink: string // For glows
  }
}

export interface VisualConfig {
  light: VisualColors
  dark: VisualColors
}

/**
 * Visual colors configuration with light/dark theme support.
 *
 * Light mode: Deeper, more saturated colors for visibility on light backgrounds
 * Dark mode: Slightly brighter/more luminous for visibility on dark backgrounds
 */
export const visualConfig: VisualConfig = {
  light: {
    rainbow: {
      red: '#ef4444', // Tailwind red-500 - vibrant pride red
      orange: '#f97316', // Tailwind orange-500
      yellow: '#eab308', // Tailwind yellow-500
      green: '#22c55e', // Tailwind green-500
      blue: '#3b82f6', // Tailwind blue-500
      purple: '#8b5cf6', // Tailwind violet-500
    },
    gold: {
      white: '#ffffff',
      light: '#ffd700', // Classic gold
      medium: '#ffaa00', // Amber gold
      dark: '#ff8c00', // Dark orange gold
    },
    accents: {
      violet: '#7c3aed', // Tailwind violet-600
      pink: '#ec4899', // Tailwind pink-500
    },
  },
  dark: {
    rainbow: {
      red: '#f87171', // Tailwind red-400 - brighter
      orange: '#fb923c', // Tailwind orange-400
      yellow: '#facc15', // Tailwind yellow-400
      green: '#4ade80', // Tailwind green-400
      blue: '#60a5fa', // Tailwind blue-400
      purple: '#a78bfa', // Tailwind violet-400
    },
    gold: {
      white: '#ffffff',
      light: '#fde047', // Tailwind yellow-300 - brighter gold
      medium: '#fbbf24', // Tailwind amber-400
      dark: '#f59e0b', // Tailwind amber-500
    },
    accents: {
      violet: '#a78bfa', // Tailwind violet-400 - brighter
      pink: '#f472b6', // Tailwind pink-400
    },
  },
}

/**
 * Pre-computed color arrays for common use cases
 */

/** Rainbow colors as ordered array (red -> purple) */
export const getRainbowArray = (colors: VisualColors) => [
  colors.rainbow.red,
  colors.rainbow.orange,
  colors.rainbow.yellow,
  colors.rainbow.green,
  colors.rainbow.blue,
  colors.rainbow.purple,
]

/** Rainbow gradient string for SVG SMIL animations */
export const getRainbowAnimationValues = (colors: VisualColors) => {
  const arr = getRainbowArray(colors)
  return arr.join(';') + ';' + arr[0] // Loop back to start
}

/** Rainbow colors as gradient stops with offsets */
export const getRainbowStops = (colors: VisualColors) => [
  { offset: '0%', color: colors.rainbow.red },
  { offset: '20%', color: colors.rainbow.orange },
  { offset: '40%', color: colors.rainbow.yellow },
  { offset: '60%', color: colors.rainbow.green },
  { offset: '80%', color: colors.rainbow.blue },
  { offset: '100%', color: colors.rainbow.purple },
]

/** Gold gradient stops */
export const getGoldStops = (colors: VisualColors) => [
  { offset: '0%', color: colors.gold.white },
  { offset: '30%', color: colors.gold.light },
  { offset: '70%', color: colors.gold.medium },
  { offset: '100%', color: colors.gold.dark },
]

/**
 * Orb colors with transparency for AmbientBackground
 * Each orb transitions from one rainbow color to the next
 */
export const getOrbColors = (colors: VisualColors, opacity = { from: 0.4, to: 0.25 }) => {
  const arr = getRainbowArray(colors)
  return arr.map((color, i) => {
    const nextColor = arr[(i + 1) % arr.length]
    // Convert hex to rgba
    const fromRgba = hexToRgba(color, opacity.from)
    const toRgba = hexToRgba(nextColor!, opacity.to)
    return { from: fromRgba, to: toRgba }
  })
}

/**
 * Particle colors for AmbientBackground shimmer
 */
export const getParticleColors = (colors: VisualColors) => [
  'rgba(255, 255, 255, 0.95)', // White sparkle
  hexToRgba(colors.rainbow.red, 0.85),
  hexToRgba(colors.rainbow.orange, 0.85),
  hexToRgba(colors.rainbow.yellow, 0.9),
  hexToRgba(colors.rainbow.green, 0.85),
  hexToRgba(colors.rainbow.blue, 0.85),
  hexToRgba(colors.rainbow.purple, 0.85),
]

/**
 * Star gradient CSS for golden stars
 */
export const getStarGradient = (colors: VisualColors) =>
  `linear-gradient(135deg, ${colors.gold.white} 0%, ${colors.gold.light} 30%, ${colors.gold.medium} 60%, ${colors.gold.dark} 100%)`

/**
 * Star glow filter CSS
 */
export const getStarGlow = (colors: VisualColors) =>
  `drop-shadow(0 0 8px ${hexToRgba(colors.gold.light, 0.9)}) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))`

// Helper: Convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
