import type { BrandConfig } from '~/types/brand'

/**
 * Brand Configuration - Single Source of Truth
 *
 * This file defines ALL brand colors and fonts for the application.
 * Components use Tailwind classes (bg-brand-accent, font-headers) that
 * reference these values via CSS variables.
 *
 * ## Quick Reference
 *
 * | Color      | Light Mode Use                | Dark Mode Use               |
 * |------------|-------------------------------|-----------------------------|
 * | base       | Dark text on light surfaces   | Light text on dark surfaces |
 * | accent     | Primary brand color           | Slightly brighter variant   |
 * | contrast   | High-impact CTAs              | Same or adjusted for dark   |
 * | secondary  | Supporting accent             | Slightly brighter variant   |
 * | neutral    | Cards, elevated surfaces      | Elevated dark surfaces      |
 * | background | Page canvas (light)           | Page canvas (dark)          |
 *
 * ## Changing the Brand
 *
 * 1. Edit the values below
 * 2. All components automatically update
 * 3. No other files need modification
 *
 * @see app/types/brand.ts for detailed documentation on each color role
 */
export const brandConfig: BrandConfig = {
  name: 'Nuxt Template',
  tagline: 'Full-Stack Vue Framework',

  /**
   * Light Mode Palette
   *
   * Design principle: Dark text on light surfaces.
   * Palette harmony: Emerald accent with teal secondary (analogous)
   * and amber contrast (complementary split).
   */
  light: {
    /**
     * Base: Slate 900
     * - Primary text color
     * - Contrast with background (#ffffff): 17.4:1 ✓
     */
    base: '#0f172a',

    /**
     * Accent: Emerald 600
     * - Primary brand color, buttons, links
     * - Conveys: growth, freshness, reliability (matches Nuxt branding)
     */
    accent: '#059669',

    /**
     * Contrast: Amber 500
     * - High-visibility CTAs, limited use
     * - Complementary to emerald
     */
    contrast: '#f59e0b',

    /**
     * Secondary: Teal 600
     * - Analogous to emerald (adjacent on color wheel)
     * - Secondary buttons, tags, badges
     */
    secondary: '#0891b2',

    /**
     * Neutral: Slate 50
     * - Cards, elevated surfaces
     * - Subtle distinction from pure white background
     */
    neutral: '#f8fafc',

    /**
     * Background: Pure white
     * - Page canvas, largest surface area
     */
    background: '#ffffff',
  },

  /**
   * Dark Mode Palette
   *
   * Design principle: Light text on dark surfaces.
   * Key inversions: base becomes light, background becomes dark.
   */
  dark: {
    /**
     * Base: Slate 100
     * - INVERTED from light mode
     * - Contrast with background (#0f172a): 15.24:1 ✓
     */
    base: '#f1f5f9',

    /**
     * Accent: Emerald 400
     * - Brightened from light mode for dark background visibility
     */
    accent: '#34d399',

    /**
     * Contrast: Amber 400
     * - Brightened for dark mode
     */
    contrast: '#fbbf24',

    /**
     * Secondary: Teal 400
     * - Brightened from light mode
     */
    secondary: '#2dd4bf',

    /**
     * Neutral: Slate 800
     * - Elevated dark surface (lighter than background)
     */
    neutral: '#1e293b',

    /**
     * Background: Slate 900
     * - INVERTED from light mode
     */
    background: '#0f172a',
  },

  /**
   * Typography Configuration
   *
   * Font pairing: Clean sans-serif system for modern feel.
   * Personality: Professional, modern, developer-friendly.
   */
  typography: {
    /**
     * Logo: Inter (bold weight)
     * - Clean, modern display for brand recognition
     */
    logo: 'Inter',

    /**
     * Headers: Inter
     * - Professional sans-serif for hierarchy
     */
    headers: 'Inter',

    /**
     * Primary: Inter
     * - Highly readable for body text
     */
    primary: 'Inter',

    /**
     * Secondary: JetBrains Mono
     * - Monospace for code and technical content
     */
    secondary: 'JetBrains Mono',
  },
}

/*
 * ============================================================================
 * BRAND PALETTE EXAMPLES
 * ============================================================================
 *
 * Copy and modify brandConfig above to match your brand.
 *
 * ----------------------------------------------------------------------------
 * NUXT GREEN (default above)
 * ----------------------------------------------------------------------------
 * accent: '#059669' (Emerald 600) - Nuxt's signature green
 *
 * ----------------------------------------------------------------------------
 * CORPORATE BLUE
 * ----------------------------------------------------------------------------
 * light: {
 *   accent: '#2563eb',     // Blue 600
 *   secondary: '#0891b2',  // Cyan 600
 *   contrast: '#f59e0b',   // Amber 500
 * }
 *
 * ----------------------------------------------------------------------------
 * CREATIVE PURPLE
 * ----------------------------------------------------------------------------
 * light: {
 *   accent: '#7c3aed',     // Violet 600
 *   secondary: '#db2777',  // Pink 600
 *   contrast: '#22d3ee',   // Cyan 400
 * }
 */
