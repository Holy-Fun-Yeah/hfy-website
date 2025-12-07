import Unfonts from 'unplugin-fonts/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/devtools'],

  // Auto-import components without directory prefix
  components: [{ path: '~/components', pathPrefix: false }],

  // Code-based routing - routes defined in app/router.options.ts
  // Pages scanning is enabled but routes are overridden programmatically

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
      ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    },
  },

  vite: {
    plugins: [
      Unfonts({
        google: {
          families: ['Inter:wght@400;500;600;700', 'JetBrains Mono:wght@400;500'],
        },
      }),
    ],
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Nuxt Site',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
