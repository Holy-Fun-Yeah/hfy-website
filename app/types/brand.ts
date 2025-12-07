/**
 * Brand Config Type Definitions
 *
 * A semantic color and typography system designed for consistency across any brand.
 * This system follows the 60-30-10 rule and ensures WCAG AA contrast compliance.
 *
 * ## The 6-Color Semantic Palette
 *
 * | Role       | Coverage | Purpose                                    |
 * |------------|----------|--------------------------------------------|
 * | background | ~60%     | Page canvas, largest surface area          |
 * | neutral    | ~20%     | Cards, elevated surfaces, subtle sections  |
 * | base       | ~15%     | Text, icons, borders (foreground content)  |
 * | accent     | ~3%      | Primary actions, links, brand emphasis     |
 * | secondary  | ~1%      | Supporting actions, tags, badges           |
 * | contrast   | ~1%      | High-impact CTAs, critical actions         |
 */

/**
 * Semantic color palette for a single theme mode.
 *
 * ### The 60-30-10 Rule
 * - 60% dominant color (background) - calming, unobtrusive
 * - 30% secondary colors (neutral, base) - structure, readability
 * - 10% accent colors (accent, secondary, contrast) - emphasis, action
 *
 * ### Contrast Requirements (WCAG AA)
 * - Normal text: 4.5:1 contrast ratio minimum
 * - Large text (18px+ or 14px bold): 3:1 minimum
 * - UI components: 3:1 against adjacent colors
 */
export interface BrandPalette {
  /**
   * **Base** - Primary foreground color for text and icons
   *
   * - Light mode: Use DARK colors (slate-900, near-black)
   * - Dark mode: Use LIGHT colors (slate-100, near-white)
   * - MUST INVERT between themes
   *
   * Usage: `text-brand-base`, `text-brand-base/70`, `border-brand-base/10`
   */
  base: string

  /**
   * **Accent** - Primary brand color for interactive elements
   *
   * The signature brand color for buttons, links, and emphasis.
   * Dark mode: Often needs to be 1-2 shades lighter for visibility.
   *
   * Usage: `bg-brand-accent`, `text-brand-accent`, `border-brand-accent`
   */
  accent: string

  /**
   * **Contrast** - High-visibility color for critical CTAs
   *
   * Maximum attention-grabbing color. Use sparingly (1-2 elements per screen).
   * Should be visually distinct from accent (complementary or triadic).
   *
   * Usage: `bg-brand-contrast text-brand-base` for hero CTAs
   */
  contrast: string

  /**
   * **Secondary** - Supporting accent for variety and hierarchy
   *
   * Complementary to accent for secondary actions and visual variety.
   * Should harmonize with accent (analogous or triadic relationship).
   *
   * Usage: `bg-brand-secondary`, secondary buttons, tags, badges
   */
  secondary: string

  /**
   * **Neutral** - Elevated surfaces and cards
   *
   * Background for cards, modals, and elevated UI elements.
   * Light mode: Slightly off-white. Dark mode: Slightly lighter than background.
   *
   * Usage: `bg-brand-neutral` for cards, modals, dropdowns
   */
  neutral: string

  /**
   * **Background** - Page canvas and primary surface
   *
   * The foundational layer. Should be calming and unobtrusive.
   * MUST INVERT between themes (light in light mode, dark in dark mode).
   *
   * Usage: `bg-brand-background` at layout level
   */
  background: string
}

/**
 * Typography system with semantic font roles.
 *
 * ## The 4-Font System
 *
 * | Role      | Purpose                        | Characteristics            |
 * |-----------|--------------------------------|----------------------------|
 * | logo      | Brand mark, hero text          | Distinctive, memorable     |
 * | headers   | Page titles, section headings  | Strong, scannable          |
 * | primary   | Body text, paragraphs          | Readable, comfortable      |
 * | secondary | Code, captions, metadata       | Functional, compact        |
 */
export interface BrandTypography {
  /** Display font for brand identity - logo, hero headlines only */
  logo: string
  /** Heading font for titles and sections - h1, h2, h3 */
  headers: string
  /** Body font for main content - paragraphs, buttons, labels */
  primary: string
  /** Supporting font for technical content - code, timestamps, captions */
  secondary: string
}

/** Theme mode options */
export type ThemeMode = 'light' | 'dark'

/**
 * Complete brand configuration with theme support.
 *
 * ## Theme Inversion Rules
 *
 * | Color      | Light Mode    | Dark Mode     | Inversion |
 * |------------|---------------|---------------|-----------|
 * | base       | DARK color    | LIGHT color   | YES       |
 * | background | LIGHT color   | DARK color    | YES       |
 * | neutral    | Light-ish     | Dark-ish      | YES       |
 * | accent     | Vibrant       | Brighter      | Adjust    |
 * | secondary  | Vibrant       | Brighter      | Adjust    |
 * | contrast   | High-vis      | High-vis      | Maybe     |
 */
export interface BrandConfig {
  name: string
  tagline: string | string[]
  /** Light mode palette - base is dark, background is light */
  light: BrandPalette
  /** Dark mode palette - base is light, background is dark */
  dark: BrandPalette
  typography: BrandTypography
}
