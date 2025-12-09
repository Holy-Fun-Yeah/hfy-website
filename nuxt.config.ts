import Unfonts from 'unplugin-fonts/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/devtools', 'motion-v/nuxt'],

  // SEO defaults
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Holy Fuck Yeah! — Awaken Your Cosmic Power',
      titleTemplate: '%s | HFY!',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Transformative experiences guided by modern astrology and ancient intuition. Book sessions, attend celestial events, and awaken your cosmic power.',
        },
        { name: 'theme-color', content: '#d81b60' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Holy Fuck Yeah!' },
        {
          property: 'og:title',
          content: 'Holy Fuck Yeah! — Awaken Your Cosmic Power',
        },
        {
          property: 'og:description',
          content: 'Transformative experiences guided by modern astrology and ancient intuition.',
        },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Holy Fuck Yeah!' },
        {
          name: 'twitter:description',
          content: 'Transformative experiences guided by modern astrology and ancient intuition.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

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
          families: ['Playfair Display:wght@400;500;600;700', 'Poppins:wght@300;400;500;600;700'],
        },
      }),
    ],
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Holy Fuck Yeah!',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disabled due to vite-plugin-checker bug; use `yarn type-check` instead
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
