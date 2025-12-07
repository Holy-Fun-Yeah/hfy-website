# Nuxt Site Template

A production-ready Nuxt 4 template with brand theming, standardized API responses, and atomic design.

## Features

- **Nuxt 4** with future compatibility mode
- **Tailwind CSS v4** with brand color system
- **Pinia** for state management
- **Drizzle ORM** for type-safe PostgreSQL
- **Vitest** for testing
- **Zod** for runtime validation
- **ESLint + Prettier** with auto-formatting

## Quick Start

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start development server
yarn dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

All server-side env vars are centralized in `server/env.ts` with Zod validation.

```bash
# Required
APP_ENV=development  # development | staging | production

# Optional
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

Missing required vars throw at startup.

## Project Structure

```
app/
├── config/brand.ts      # Brand colors/fonts (single source of truth)
├── components/          # Atomic Design
│   ├── atoms/           # BaseButton, BaseMarkdown
│   ├── molecules/       # FeatureCard
│   └── organisms/       # AppHeader, AppFooter
├── composables/         # useBrand, useTheme, useApi
├── stores/              # Pinia stores
├── pages/               # File-based routing
└── assets/css/main.css  # Tailwind theme

server/
├── env.ts               # Centralized env vars
├── lib/                 # API response library (MUST USE)
├── api/                 # API routes
└── database/            # Drizzle schema
```

## Brand System

All colors and fonts come from `app/config/brand.ts`. Never hardcode colors.

```vue
<!-- Use brand classes -->
<button class="bg-brand-accent text-brand-neutral">Click</button>
<h1 class="font-headers text-brand-base">Title</h1>
```

Theme toggle with `useTheme()`:

```vue
<script setup>
const { isDark, toggleTheme } = useTheme()
</script>
```

## API Handlers

All API routes must use `server/lib/` for standardized responses.

```ts
import { defineApiHandler, Errors } from '../../lib'

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw Errors.badRequest('Invalid ID')

  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!user) throw Errors.notFound('User not found')

  return user // Auto-wrapped: { success: true, timestamp, data }
})
```

## Database Setup

```bash
# Generate migrations
yarn db:generate

# Apply migrations
yarn db:migrate

# Open Drizzle Studio
yarn db:studio
```

## Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test --watch
```

## Scripts

| Command           | Description          |
| ----------------- | -------------------- |
| `yarn dev`        | Start dev server     |
| `yarn build`      | Build for production |
| `yarn test`       | Run tests            |
| `yarn lint`       | Run ESLint           |
| `yarn format`     | Format with Prettier |
| `yarn type-check` | TypeScript check     |
| `yarn db:studio`  | Open Drizzle Studio  |

## Documentation

See `CLAUDE.md` for detailed development guidelines.
