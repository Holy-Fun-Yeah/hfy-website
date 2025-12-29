<script setup lang="ts">
/**
 * AppFooter - Brand-aware footer with holographic accents
 *
 * Features:
 * - Gradient accent line at top border
 * - Holographic brand logo
 * - Glow effect on social icon hover
 * - Uses brand color tokens
 * - i18n translations
 */
const { brand } = useBrand()
const { t } = useLocale()
const year = new Date().getFullYear()

const socialLinks = [
  { name: 'Instagram', href: '#', icon: 'instagram' },
  { name: 'TikTok', href: '#', icon: 'tiktok' },
  { name: 'YouTube', href: '#', icon: 'youtube' },
]

const quickLinks = computed(() => [
  { label: t('nav.about'), to: '/about' },
  { label: t('nav.blog'), to: '/blog' },
  { label: t('nav.events'), to: '/events' },
  { label: t('common.bookNow'), to: '/book' },
])

const legalLinks = computed(() => [
  { label: t('footer.privacy'), to: '/privacy' },
  { label: t('footer.terms'), to: '/terms' },
])
</script>

<template>
  <footer class="bg-brand-neutral/50">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <!-- Top section: Brand + Links -->
      <div class="grid gap-8 md:grid-cols-3">
        <!-- Brand column -->
        <div>
          <!-- Holographic brand logo -->
          <NuxtLink
            to="/"
            class="font-logo text-xl font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_var(--color-brand-glow)]"
          >
            <span
              class="from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end bg-gradient-to-r bg-clip-text text-transparent"
            >
              {{ brand.name }}
            </span>
          </NuxtLink>
          <p class="text-brand-muted mt-3 text-sm">
            {{ t('footer.description') }}
          </p>

          <!-- Social links with glow hover -->
          <div class="mt-4 flex gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg p-1.5 transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <!-- Instagram -->
              <svg
                v-if="social.icon === 'instagram'"
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>

              <!-- TikTok -->
              <svg
                v-if="social.icon === 'tiktok'"
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                />
              </svg>

              <!-- YouTube -->
              <svg
                v-if="social.icon === 'youtube'"
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick links column -->
        <div>
          <h3 class="font-headers text-brand-base mb-3 font-semibold">{{ t('footer.explore') }}</h3>
          <ul class="space-y-2">
            <li
              v-for="link in quickLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-brand-muted hover:text-brand-accent text-sm transition-colors duration-200"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal column -->
        <div>
          <h3 class="font-headers text-brand-base mb-3 font-semibold">{{ t('footer.legal') }}</h3>
          <ul class="space-y-2">
            <li
              v-for="link in legalLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-brand-muted hover:text-brand-accent text-sm transition-colors duration-200"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom section: Copyright with gradient accent -->
      <div class="border-brand-base/10 mt-8 border-t pt-6">
        <p class="text-brand-muted text-center text-sm">
          &copy; {{ year }} {{ brand.name }}. {{ t('footer.copyright') }}
        </p>
      </div>
    </div>
  </footer>
</template>
