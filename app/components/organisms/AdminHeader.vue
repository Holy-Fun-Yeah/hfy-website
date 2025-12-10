<script setup lang="ts">
/**
 * AdminHeader - Simplified navigation for admin pages
 *
 * Features:
 * - "HFY! Editor" branding
 * - Navigation to editable sections (About, Blog, Events)
 * - Theme toggle
 * - User menu with sign out
 */

const { brand } = useBrand()
const { isDark, toggleTheme } = useTheme()
const { t } = useLocale()
const { isLoggedIn, signOut } = useAuth()

// Navigation links to editable sections
const navLinks = computed(() => [
  { to: '/about', label: t('nav.about') },
  { to: '/blog', label: t('nav.blog') },
  { to: '/events', label: t('nav.events') },
])

// Scroll-aware header transparency
const isScrolled = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 backdrop-blur-lg transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-brand-background/50 shadow-brand-base/5 shadow-sm'
        : 'bg-brand-background/80',
    ]"
  >
    <nav class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
      <!-- Logo: HFY! Editor -->
      <NuxtLink
        to="/admin/editor"
        class="font-logo flex items-center gap-2 text-xl font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_var(--color-brand-glow)]"
      >
        <span
          class="from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end bg-gradient-to-r bg-clip-text text-transparent"
        >
          {{ brand.name }}
        </span>
        <span class="text-brand-muted text-sm font-normal">Editor</span>
      </NuxtLink>

      <!-- Nav links to editable sections -->
      <ul class="font-primary hidden items-center gap-6 md:flex">
        <li
          v-for="link in navLinks"
          :key="link.to"
        >
          <NuxtLink
            :to="link.to"
            target="_blank"
            class="nav-link text-brand-muted hover:text-brand-accent flex items-center gap-1 py-1 transition-colors duration-200"
          >
            {{ link.label }}
            <svg
              class="h-3 w-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <!-- Back to Website -->
        <NuxtLink
          to="/"
          class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span class="hidden sm:inline">{{ t('admin.backToWebsite') }}</span>
        </NuxtLink>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg p-2 transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg
            v-if="!isDark"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <!-- Sign Out Button (if logged in) -->
        <button
          v-if="isLoggedIn"
          type="button"
          class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
          @click="signOut()"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {{ t('auth.signOut') }}
        </button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    to right,
    var(--color-brand-gradient-start),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-end)
  );
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-link:hover::after {
  transform: scaleX(1);
}
</style>
