# Claude Code Guidelines

Project-specific guidelines for Claude Code when working on this Nuxt template.

## Architecture

```
app/
├── config/brand.ts      # Single source of truth for colors/fonts
├── types/brand.ts       # Brand type definitions
├── components/          # Atomic Design (auto-imported, no prefix)
│   ├── atoms/           # Indivisible: BaseButton, EnergyThreads, SacredGeometry
│   ├── molecules/       # Atom groups: FeatureCard, PageSection
│   └── organisms/       # Sections: AppHeader, HeroSection
├── composables/
│   ├── useBrand.ts      # Brand colors/fonts (theme-aware)
│   ├── useTheme.ts      # Light/dark mode
│   ├── useMarkdown.ts   # Load markdown files
│   ├── useScrollGradient.ts  # Scroll-based color transitions
│   └── useApi.ts        # API fetch helpers
├── stores/              # Pinia stores (auto-imported)
├── layouts/default.vue  # Main layout (with ethereal decorations)
├── pages/               # File-based routing
└── assets/css/main.css  # Tailwind @theme + prose + animations

server/
├── env.ts               # Centralized env vars (Zod validated)
├── lib/                 # Standardized response library (MUST USE)
│   ├── index.ts         # Single import point
│   ├── error.ts         # AppError class + Errors factory
│   ├── result.ts        # Result<T,E> pattern (optional)
│   ├── response.ts      # Response types + helpers
│   └── handler.ts       # defineApiHandler, defineResultHandler
├── api/                 # API routes (file-based)
├── utils/               # Validation schemas
└── database/            # Drizzle schema + connection

docs/
├── STYLE_GUIDELINE.md   # Visual design system (Holographic Mystic Maximalism)
└── ...                  # Project docs
```

## Environment Variables

All server-side env vars loaded via `server/env.ts`. Validated with Zod at startup.

```ts
// server/env.ts - Add new vars here
const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().optional(),
  // Add more as needed
})

// Usage anywhere in server/
import { env, isDev, isProd } from '../env'
console.log(env.APP_ENV)
if (isDev) console.log('Development mode')
```

Required vars throw on startup if missing. See `.env.example` for reference.

## Components (Atomic Design)

Components follow [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) and are auto-imported without path prefix.

| Level         | Folder       | Description             | Examples                                        |
| ------------- | ------------ | ----------------------- | ----------------------------------------------- |
| **Atoms**     | `atoms/`     | Indivisible UI elements | `BaseButton`, `EnergyThreads`, `SacredGeometry` |
| **Molecules** | `molecules/` | Groups of atoms         | `FeatureCard`, `PageSection`                    |
| **Organisms** | `organisms/` | Complex sections        | `AppHeader`, `HeroSection`                      |

```vue
<!-- All components auto-imported by name, regardless of folder -->
<BaseButton variant="primary">Click</BaseButton>
<FeatureCard title="Feature" description="..." icon="bolt" />
<AppHeader />
```

When creating new components:

- **Atoms**: Single-purpose, no dependencies on other components
- **Molecules**: Combine 2+ atoms, still reusable across contexts
- **Organisms**: Context-specific sections, may include business logic

## Brand System

**All colors/fonts MUST come from `app/config/brand.ts`. Never hardcode.**

### Aesthetic Direction

**"Holographic Mystic Maximalism"** — Warm Abundant Base + Pride Rainbow Cosmic Accents

| Principle  | Expression                                                        |
| ---------- | ----------------------------------------------------------------- |
| **Warmth** | Cream/pearl backgrounds, golden accents, soft shadows             |
| **Pride**  | LGBTQ rainbow spectrum (red→orange→yellow→green→blue→purple)      |
| **Cosmic** | Ethereal energy threads, sacred geometry, aurora-like decorations |
| **Sacred** | Intentional hierarchy, breathing animations, reverent pacing      |

**Theme Moods:**

- **Light Mode ("Sacred Daylight")**: Warm, inviting, abundant
- **Dark Mode ("Cosmic Night")**: Mystical, deep, luminous

**Ethereal Decorations** (global, in default layout):

- `EnergyThreads` — Flowing light beams along margins (pride rainbow)
- `SacredGeometry` — Rotating patterns at corners (flower of life, metatron, spiral)
- `AmbientBackground` — Rainbow orbs, particles, golden stars
- `RadialBurst` — Sunburst rays behind hero content

See `docs/STYLE_GUIDELINE.md` for complete visual design system.

### Available Classes

```
Colors:  bg-brand-{background|neutral|base|accent|secondary|contrast}
         text-brand-{base|muted|accent|secondary|contrast|neutral}
         border-brand-{base|accent|secondary|contrast|neutral}
         Opacity: bg-brand-accent/50, text-brand-base/80

Gradients: from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end

Fonts:   font-logo, font-headers, font-primary, font-secondary
```

### Usage

```vue
<!-- CORRECT -->
<button class="bg-brand-accent text-brand-neutral">Click</button>
<h1 class="font-headers text-brand-base">Title</h1>

<!-- Holographic effect (special emphasis only) -->
<div class="bg-gradient-to-r from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end p-[1px] rounded-2xl">
  <div class="bg-brand-neutral rounded-2xl p-6">Content</div>
</div>

<!-- WRONG - Never use default Tailwind colors for UI -->
<button class="bg-emerald-600 text-white">Click</button>
<div class="bg-gradient-to-r from-pink-400 to-cyan-400">Hardcoded!</div>
```

### Theme Toggle

```vue
<script setup>
const { isDark, toggleTheme } = useTheme()
</script>
```

See `app/config/brand.ts` for color definitions, `app/types/brand.ts` for type docs.

## State Management (Pinia)

Stores auto-imported from `app/stores/`. Use setup syntax.

```ts
// app/stores/myStore.ts
export const useMyStore = defineStore('myStore', () => {
  const items = ref<string[]>([])
  const loading = ref(false)
  const isEmpty = computed(() => items.value.length === 0)

  async function fetchItems() {
    loading.value = true
    items.value = await $fetch('/api/items')
    loading.value = false
  }

  return { items, loading, isEmpty, fetchItems }
})
```

Use `storeToRefs()` for reactive destructuring: `const { items } = storeToRefs(store)`

## Markdown Rendering

```vue
<script setup>
const { content, load } = useMarkdown()
load('/content/article.md')
</script>

<template>
  <BaseMarkdown :content="content" size="lg" />
</template>
```

Classes: `prose`, `prose-sm`, `prose-lg`, `prose-full`

## API Handlers (REQUIRED)

**All API handlers MUST use `server/lib/` for standardized responses.**

### Response Format

```ts
// Success: { success: true, timestamp, data }
// Error:   { success: false, timestamp, error: { status, code, message } }
// Paginated: { success: true, timestamp, data, pagination }
```

### Handler Patterns

| Handler                        | Pattern | Use Case                      |
| ------------------------------ | ------- | ----------------------------- |
| `defineApiHandler`             | Throw   | Simple handlers (recommended) |
| `defineResultHandler`          | Result  | Complex validation flows      |
| `definePaginatedApiHandler`    | Throw   | Paginated lists               |
| `definePaginatedResultHandler` | Result  | Paginated with validation     |

### Throw Pattern (Recommended)

```ts
import { defineApiHandler, Errors } from '../../lib'

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw Errors.badRequest('Invalid ID')

  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!user) throw Errors.notFound('User not found')

  return user // Auto-wrapped in success response
})
```

### Result Pattern (For complex flows)

```ts
import { defineResultHandler, Errors, Result } from '../../lib'

export default defineResultHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) return Result.err(Errors.validation(parsed.error.message))

  const user = await createUser(parsed.data)
  return Result.ok(user)
})
```

### Error Factory

```ts
Errors.badRequest(msg) // 400
Errors.unauthorized(msg) // 401
Errors.forbidden(msg) // 403
Errors.notFound(msg) // 404
Errors.conflict(msg) // 409
Errors.validation(msg) // 422
Errors.internal(msg) // 500
Errors.serviceUnavailable(msg) // 503
```

### Pagination

```ts
import { createPaginationInfo, definePaginatedApiHandler } from '../../lib'

export default definePaginatedApiHandler(async (event) => {
  const { page = 1, limit = 10 } = getQuery(event)
  const items = await db.query.items.findMany({ limit, offset: (page - 1) * limit })
  const total = await db.select({ count: count() }).from(items)

  return [items, createPaginationInfo(total[0].count, page, limit)]
})
```

### Do NOT

```ts
// WRONG - Raw handler (no standardized response)
export default defineEventHandler(async () => ({ user }))

// WRONG - H3 createError (different format)
throw createError({ statusCode: 404, message: 'Not found' })

// WRONG - Plain Error (no metadata)
throw new Error('Failed')
```

## Debugging

When in doubt about whether components are rendering correctly or styles are loading, use the **Puppeteer MCP** to inspect the running app:

```
1. Start dev server: yarn dev
2. Use mcp__puppeteer__puppeteer_launch to open browser
3. Navigate to http://localhost:3000
4. Take screenshot or inspect elements
```

This is especially useful for verifying brand colors, component styling, and layout issues.
