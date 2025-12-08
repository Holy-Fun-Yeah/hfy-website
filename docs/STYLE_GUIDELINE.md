# HFY Style Guidelines

Visual design system for the Holy Fuck Yeah! brand.

**Aesthetic:** Holographic Mystic Maximalism
**Direction:** Warm Abundant Base + Cosmic Accents

---

## 1. Design Philosophy

### Core Aesthetic Principles

| Principle     | Expression                                                   |
| ------------- | ------------------------------------------------------------ |
| **Warmth**    | Cream/pearl backgrounds, golden accents, soft shadows        |
| **Abundance** | Layered surfaces, rich gradients, generous whitespace        |
| **Cosmic**    | Iridescent accents, aurora effects, prismatic highlights     |
| **Sacred**    | Intentional hierarchy, breathing animations, reverent pacing |

### Visual Hierarchy (60-30-10 Rule)

```
60% — Warm neutral base (background, surfaces)
30% — Structural elements (text, borders, cards)
10% — Prismatic accents (CTAs, highlights, decorative)
```

### Mood Board Keywords

- Holographic / Iridescent / Prismatic
- Goddess Core / Divine Feminine
- Crystal / Gemstone / Aurora
- Mexican Folk Art (grounding accent)
- Mystic Maximalism (not minimalist, but intentional)

---

## 2. Color System

### Current Semantic Palette

The existing `brandConfig` provides 6 semantic colors per theme:

| Token        | Light Mode           | Dark Mode               | Role              |
| ------------ | -------------------- | ----------------------- | ----------------- |
| `background` | Warm white `#fffbf7` | Cosmic indigo `#12121f` | Page canvas       |
| `neutral`    | Pearl `#faf8f5`      | Elevated dark `#252538` | Cards, surfaces   |
| `base`       | Volcanic `#1a1a2e`   | Pearl `#f5f3f0`         | Text, icons       |
| `accent`     | Magenta `#d81b60`    | Luminous pink `#f48fb1` | Primary actions   |
| `secondary`  | Turquoise `#00acc1`  | Bright cyan `#4dd0e1`   | Secondary actions |
| `contrast`   | Golden sun `#f9a825` | Bright gold `#ffd54f`   | High-impact CTAs  |

### Proposed Extensions

To achieve "Holographic Mystic Maximalism," we need **gradient stops** and **glow colors** that cannot be expressed with single hex values.

#### Option A: Extend BrandPalette (Recommended)

Add these semantic tokens to `BrandPalette` interface:

```typescript
interface BrandPalette {
  // ... existing colors ...

  /**
   * Muted variant of base color for secondary text
   * Light: base at 60% opacity equivalent
   * Dark: base at 70% opacity equivalent
   */
  muted: string

  /**
   * Gradient stops for holographic/rainbow effects
   * Used for borders, backgrounds, decorative elements
   */
  gradient: {
    start: string // Pink/rose
    middle: string // Violet/purple
    end: string // Cyan/turquoise
  }

  /**
   * Glow color for shadows and ambient effects
   * Typically accent color at low opacity
   */
  glow: string
}
```

#### Proposed Values

**Light Mode:**

```typescript
light: {
  // ... existing ...
  muted: '#6b6b7a',           // Volcanic gray, softer
  gradient: {
    start: '#f9a8d4',         // Pink 300
    middle: '#c4b5fd',        // Violet 300
    end: '#67e8f9',           // Cyan 300
  },
  glow: 'rgba(216, 27, 96, 0.25)',  // Accent with alpha
}
```

**Dark Mode:**

```typescript
dark: {
  // ... existing ...
  muted: '#a1a1aa',           // Zinc 400
  gradient: {
    start: '#f472b6',         // Pink 400
    middle: '#a78bfa',        // Violet 400
    end: '#22d3ee',           // Cyan 400
  },
  glow: 'rgba(244, 143, 177, 0.3)', // Accent with alpha
}
```

#### Option B: CSS Custom Properties Only

If we want to avoid schema changes, define gradients in `main.css`:

```css
@theme {
  /* Light mode gradients */
  --gradient-holographic: linear-gradient(
    135deg,
    var(--color-brand-accent) 0%,
    #c4b5fd 50%,
    var(--color-brand-secondary) 100%
  );

  /* Glow shadows */
  --shadow-glow: 0 0 30px var(--color-brand-accent / 25%);
  --shadow-glow-lg: 0 0 60px var(--color-brand-accent / 35%);
}
```

**Recommendation:** Use **Option A** for type safety and consistency with existing system.

---

## 3. Theme Handling

### Light Mode: "Sacred Daylight"

The default experience. Warm, inviting, abundant.

| Element        | Treatment                                           |
| -------------- | --------------------------------------------------- |
| **Background** | Warm cream (`bg-brand-background`)                  |
| **Surfaces**   | Pearl white with subtle warmth (`bg-brand-neutral`) |
| **Text**       | Deep volcanic for grounding (`text-brand-base`)     |
| **Accents**    | Vibrant magenta, golden CTAs                        |
| **Shadows**    | Warm, soft, pink-tinted glows                       |
| **Gradients**  | Soft pastels (pink → violet → cyan)                 |

### Dark Mode: "Cosmic Night"

The alternate experience. Mystical, deep, luminous.

| Element        | Treatment                                            |
| -------------- | ---------------------------------------------------- |
| **Background** | Deep cosmic indigo (`bg-brand-background`)           |
| **Surfaces**   | Elevated dark with subtle depth (`bg-brand-neutral`) |
| **Text**       | Pearl white for clarity (`text-brand-base`)          |
| **Accents**    | Luminous pink, bright gold (increased saturation)    |
| **Shadows**    | Glowing, aurora-like, colored shadows                |
| **Gradients**  | Saturated neons (pink → violet → cyan)               |

### Inversion Rules

| Token        | Inversion Behavior                                      |
| ------------ | ------------------------------------------------------- |
| `base`       | **Full invert** — Dark ↔ Light                          |
| `background` | **Full invert** — Light ↔ Dark                          |
| `neutral`    | **Full invert** — Lighter ↔ Darker                      |
| `accent`     | **Adjust brightness** — +15-20% lighter in dark mode    |
| `secondary`  | **Adjust brightness** — +15-20% lighter in dark mode    |
| `contrast`   | **Adjust brightness** — Slightly lighter in dark mode   |
| `gradient.*` | **Adjust saturation** — More vivid in dark mode         |
| `glow`       | **Adjust opacity** — Slightly more visible in dark mode |

### Implementation Pattern

```vue
<!-- Components automatically adapt via CSS variables -->
<div class="bg-brand-background text-brand-base">
  <div class="bg-brand-neutral rounded-2xl p-6">
    <h2 class="text-brand-accent">Title</h2>
    <p class="text-brand-muted">Description</p>
    <button class="bg-brand-contrast text-brand-base">
      Book Now
    </button>
  </div>
</div>
```

Theme switching handled by `useTheme()` composable — no component changes needed.

---

## 4. Typography

### Font Stack

| Role             | Font             | Weight        | Usage                 |
| ---------------- | ---------------- | ------------- | --------------------- |
| `font-logo`      | Playfair Display | 700           | Brand mark, hero text |
| `font-headers`   | Playfair Display | 600, 700      | H1, H2, H3            |
| `font-primary`   | Poppins          | 400, 500, 600 | Body, buttons, labels |
| `font-secondary` | Poppins          | 300, 400      | Captions, metadata    |

### Scale

```
text-xs    — 12px  — Captions, timestamps
text-sm    — 14px  — Secondary text, labels
text-base  — 16px  — Body text
text-lg    — 18px  — Lead paragraphs
text-xl    — 20px  — H4, card titles
text-2xl   — 24px  — H3
text-3xl   — 30px  — H2
text-4xl   — 36px  — H1
text-5xl   — 48px  — Hero headlines
text-6xl   — 60px  — Display text
```

### Heading Style

```css
/* Playfair Display with subtle letter-spacing */
.font-headers {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.02em;
}
```

---

## 5. Component Patterns

### Surfaces & Elevation

| Level        | Class                                  | Use Case          |
| ------------ | -------------------------------------- | ----------------- |
| **Ground**   | `bg-brand-background`                  | Page canvas       |
| **Surface**  | `bg-brand-neutral`                     | Cards, sections   |
| **Elevated** | `bg-brand-neutral shadow-lg`           | Modals, dropdowns |
| **Floating** | `bg-brand-neutral/80 backdrop-blur-md` | Nav, overlays     |

### Glassmorphism (Holographic Surfaces)

```html
<div class="bg-brand-neutral/70 border-brand-base/10 rounded-2xl border backdrop-blur-md"></div>
```

### Holographic Border

```html
<div
  class="from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end relative rounded-2xl bg-gradient-to-r p-[1px]"
>
  <div class="bg-brand-neutral rounded-2xl p-6">Content</div>
</div>
```

### Buttons

| Variant         | Treatment                                                           |
| --------------- | ------------------------------------------------------------------- |
| **Primary**     | `bg-brand-accent text-white` + glow shadow                          |
| **Contrast**    | `bg-brand-contrast text-brand-base` + gold glow                     |
| **Secondary**   | `bg-brand-secondary/10 text-brand-secondary border-brand-secondary` |
| **Ghost**       | `bg-transparent text-brand-base hover:bg-brand-base/5`              |
| **Holographic** | Gradient border + glass fill                                        |

### Cards

```html
<!-- Standard Card -->
<div class="bg-brand-neutral shadow-brand-glow rounded-2xl p-6 shadow-lg">
  <!-- Holographic Card (special emphasis) -->
  <div
    class="from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end shadow-brand-glow relative rounded-2xl bg-gradient-to-br p-[1px] shadow-lg"
  >
    <div class="bg-brand-neutral h-full rounded-2xl p-6"></div>
  </div>
</div>
```

---

## 6. Motion & Animation

### Motion Library

Use `motion-v` (Motion for Vue) for:

- Physics-based spring animations
- Scroll-triggered reveals (`whileInView`)
- Gesture interactions (`whileHover`, `whileTap`)
- Page transitions (`AnimatePresence`)
- Complex orchestration

### Animation Principles

| Principle         | Implementation                             |
| ----------------- | ------------------------------------------ |
| **Breathing**     | Slow pulsing glows (3-5s duration)         |
| **Floating**      | Gentle vertical drift with subtle rotation |
| **Ethereal Rise** | Fade + translate + blur on entrance        |
| **Plasma**        | Organic movement, slight overshoot         |
| **Expansion**     | Scale from 0.95 → 1.0 on enter             |

### Ethereal Animation Classes (CSS)

Available animation utilities in `main.css`:

```css
/* Floating animations */
.animate-float          /* 6s gentle vertical drift */
.animate-float-slow     /* 8s slower drift */
.animate-float-fast     /* 4s quicker drift */

/* Glow & pulse */
.animate-pulse-glow     /* 3s breathing glow effect */
.animate-breathe        /* 4s subtle scale breathing */

/* Effects */
.animate-shimmer        /* 2s light sweep effect */
.animate-twinkle        /* 2s star-like sparkle */
.animate-orbit          /* 20s circular orbit */
.animate-gradient-shift /* 8s gradient position animation */
.animate-ethereal-rise  /* 0.8s blur-to-focus entrance */

/* Delays for staggering */
.animate-delay-100 through .animate-delay-500

/* Hover enhancements */
.hover-float            /* Translate up on hover */
.hover-glow             /* Double glow on hover */
```

### Signature Animations (Motion-v)

```typescript
// "Ethereal entrance" - blur-to-focus reveal
const etherealEntrance = {
  initial: { opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.95 },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
}

// "Sacred scroll reveal"
const scrollReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

// "Floating orbs" ambient motion
const floatingOrb = {
  animate: {
    x: ['0%', '20%', '0%'],
    y: ['0%', '15%', '0%'],
    scale: [0.8, 1.1, 0.8],
    opacity: [0.4, 0.6, 0.4],
  },
  transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
}

// Page transition
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}
```

### Ambient Background

The `<AmbientBackground>` component creates an immersive atmosphere:

```vue
<AmbientBackground />
<!-- Default: 3 orbs, medium -->
<AmbientBackground :orbs="5" />
<!-- More orbs -->
<AmbientBackground intensity="high" />
<!-- Larger, more visible -->
<AmbientBackground :particles="true" />
<!-- With shimmer particles -->
```

### Component-Specific Motion

| Component       | Animation                              |
| --------------- | -------------------------------------- |
| **HeroSection** | Staggered blur-to-focus text reveal    |
| **PageSection** | whileInView fade-up header             |
| **Cards**       | Float prop for levitation hover effect |
| **BaseButton**  | Spring physics whileHover/whileTap     |
| **AppHeader**   | AnimatePresence mobile menu + stagger  |

### Performance Guidelines

- Animate only `transform`, `opacity`, and `filter` for 60fps
- Use `will-change` sparingly for complex animations
- Prefer CSS animations for continuous effects (float, pulse)
- Use motion-v for triggered/interactive animations
- Keep orb count reasonable (3-5) for mobile performance

---

## 7. Tailwind Utilities Reference

### Background

```
bg-brand-background     — Page canvas
bg-brand-neutral        — Cards, surfaces
bg-brand-accent         — Primary action fills
bg-brand-secondary      — Secondary fills
bg-brand-contrast       — High-impact fills
bg-brand-neutral/70     — Glassmorphism
```

### Text

```
text-brand-base         — Primary text
text-brand-muted        — Secondary text (needs extension)
text-brand-accent       — Links, emphasis
text-brand-secondary    — Tags, badges
text-brand-contrast     — On dark backgrounds
text-brand-neutral      — Inverted text on accent bg
```

### Border

```
border-brand-base/10    — Subtle dividers
border-brand-accent     — Active states
border-brand-secondary  — Secondary emphasis
```

### Shadow (Custom)

```css
/* Add to main.css */
.shadow-brand-glow {
  box-shadow: 0 0 30px var(--color-brand-glow);
}
.shadow-brand-glow-lg {
  box-shadow: 0 0 60px var(--color-brand-glow);
}
```

---

## 8. Do's and Don'ts

### Do

- Use semantic color tokens (`bg-brand-accent` not `bg-pink-500`)
- Apply gradients for special emphasis only (10% rule)
- Test both light and dark modes
- Use glassmorphism for floating elements
- Add breathing animations to hero sections
- Keep body text in `text-brand-base`

### Don't

- Hardcode hex colors in components
- Overuse holographic effects (special moments only)
- Mix brand colors with Tailwind defaults
- Use pure white (`#fff`) or pure black (`#000`)
- Apply heavy animations to frequently-seen elements
- Forget to check contrast ratios when customizing

---

## 9. Recommended Brand Config Changes

To fully support this style system, extend `app/config/brand.ts`:

```typescript
// Add to BrandPalette interface
muted: string
gradient: {
  start: string
  middle: string
  end: string
}
glow: string

// Update light palette
light: {
  ...existing,
  muted: '#6b6b7a',
  gradient: {
    start: '#f9a8d4',
    middle: '#c4b5fd',
    end: '#67e8f9',
  },
  glow: 'rgba(216, 27, 96, 0.25)',
}

// Update dark palette
dark: {
  ...existing,
  muted: '#a1a1aa',
  gradient: {
    start: '#f472b6',
    middle: '#a78bfa',
    end: '#22d3ee',
  },
  glow: 'rgba(244, 143, 177, 0.3)',
}
```

Then update `main.css` to register these as CSS custom properties.

---

## 10. File Reference

| File                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `app/config/brand.ts`         | Color and typography values           |
| `app/types/brand.ts`          | TypeScript interfaces                 |
| `app/assets/css/main.css`     | CSS custom properties, Tailwind theme |
| `app/composables/useBrand.ts` | Runtime access to brand values        |
| `app/composables/useTheme.ts` | Light/dark mode switching             |
