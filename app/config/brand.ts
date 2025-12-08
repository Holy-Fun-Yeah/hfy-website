import type { BrandConfig } from '~/types/brand'

/**
 * HFY (Holy Fuck Yeah!) Brand Configuration
 *
 * Rainbow Diamond Light aesthetic with cosmic, iridescent energy.
 * Reflects AstraNova KaLeKa's infinite consciousness and expansion.
 *
 * ## Color Philosophy
 * - Iridescent rainbow gradient: pink, turquoise, golden sun
 * - Grounding tones: copper, volcanic gray, deep indigo
 * - Pearl white neutrals for elevated surfaces
 *
 * ## Typography
 * - Playfair Display: Elegant serif for titles and brand mark
 * - Poppins: Modern, friendly sans-serif for body text
 *
 * @see ~/docs/project.md for HFY Creative Blueprint
 */
export const brandConfig: BrandConfig = {
  name: 'Holy Fuck Yeah!',
  tagline: [
    'Awaken Your Cosmic Power',
    'Rainbow Diamond Light Overflow',
    'Sacred Sovereign Expansion',
  ],

  /**
   * Light Mode Palette — "Sacred Daylight"
   *
   * Design principle: Warm abundant base with cosmic accents.
   * Aesthetic: Holographic Mystic Maximalism
   */
  light: {
    /**
     * Base: Deep volcanic indigo
     * - Primary text color with cosmic depth
     * - Contrast with background (#fffbf7): 14.8:1 ✓
     */
    base: '#1a1a2e',

    /**
     * Muted: Warm gray
     * - Secondary text, captions, metadata
     * - Softer than base for visual hierarchy
     */
    muted: '#6b6b7a',

    /**
     * Accent: Vibrant magenta/pink
     * - Primary HFY brand color
     * - Conveys: Divine feminine, cosmic love, radiant power
     */
    accent: '#d81b60',

    /**
     * Contrast: Golden sun
     * - High-visibility CTAs, sacred moments
     * - Represents: Abundance, joy, sovereign power
     */
    contrast: '#f9a825',

    /**
     * Secondary: Turquoise
     * - Balance, flow, infinite expansion
     * - Complement to magenta for visual harmony
     */
    secondary: '#00acc1',

    /**
     * Neutral: Pearl white with warm tint
     * - Cards, elevated surfaces
     * - Subtle warmth reflecting HFY's embracing energy
     */
    neutral: '#faf8f5',

    /**
     * Background: Warm white
     * - Page canvas with soft, sacred feeling
     */
    background: '#fffbf7',

    /**
     * Gradient: Holographic rainbow stops
     * - Pink → Violet → Cyan for prismatic effects
     * - Saturated for readability on light backgrounds
     * - Use for logos, headings, borders, decorative
     */
    gradient: {
      start: '#db2777', // Pink 600 - rich magenta
      middle: '#7c3aed', // Violet 600 - deep purple
      end: '#0891b2', // Cyan 600 - vibrant teal
    },

    /**
     * Glow: Accent-tinted shadow
     * - Warm pink glow for elevated elements
     * - Creates "breathing" ambient effect
     */
    glow: 'rgba(216, 27, 96, 0.2)',
  },

  /**
   * Dark Mode Palette — "Cosmic Night"
   *
   * Design principle: Mystical depths with luminous accents.
   * Aesthetic: Aurora against cosmic void
   */
  dark: {
    /**
     * Base: Pearl white
     * - INVERTED from light mode
     * - Contrast with background (#12121f): 15.6:1 ✓
     */
    base: '#f5f3f0',

    /**
     * Muted: Soft gray
     * - Secondary text for dark backgrounds
     * - Visible but subdued
     */
    muted: '#a1a1aa',

    /**
     * Accent: Luminous pink
     * - Brightened for dark mode visibility
     * - Glowing, plasma-like quality
     */
    accent: '#f48fb1',

    /**
     * Contrast: Bright gold
     * - Solar energy against cosmic darkness
     */
    contrast: '#ffd54f',

    /**
     * Secondary: Bright turquoise
     * - Ethereal glow effect
     */
    secondary: '#4dd0e1',

    /**
     * Neutral: Elevated volcanic
     * - Cards and surfaces with depth
     * - Slightly lighter than background
     */
    neutral: '#252538',

    /**
     * Background: Deep cosmic indigo
     * - Night sky canvas
     * - Foundation for luminous elements
     */
    background: '#12121f',

    /**
     * Gradient: Saturated holographic stops
     * - More vivid for dark mode visibility
     * - Aurora-like neon quality
     */
    gradient: {
      start: '#f472b6', // Pink 400
      middle: '#a78bfa', // Violet 400
      end: '#22d3ee', // Cyan 400
    },

    /**
     * Glow: Luminous pink shadow
     * - Brighter glow for dark backgrounds
     * - Creates ethereal floating effect
     */
    glow: 'rgba(244, 143, 177, 0.25)',
  },

  /**
   * Typography Configuration
   *
   * Font pairing: Elegant serif headers with friendly body text.
   * Personality: Sacred, empowering, radiant, joyful.
   */
  typography: {
    /**
     * Logo: Playfair Display
     * - Elegant, distinctive serif for brand mark
     * - Conveys sophistication and timeless wisdom
     */
    logo: 'Playfair Display',

    /**
     * Headers: Playfair Display
     * - Beautiful serif for titles and sections
     * - Creates visual hierarchy with elegance
     */
    headers: 'Playfair Display',

    /**
     * Primary: Poppins
     * - Modern, geometric sans-serif for body text
     * - Highly readable with friendly personality
     */
    primary: 'Poppins',

    /**
     * Secondary: Poppins
     * - Consistent feel for captions and metadata
     * - Light weight for supporting text
     */
    secondary: 'Poppins',
  },
}
