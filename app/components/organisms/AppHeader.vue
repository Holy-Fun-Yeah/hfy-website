<script setup lang="ts">
/**
 * AppHeader - Frosted glass navigation with holographic accents
 *
 * Features:
 * - Glassmorphism navbar with enhanced blur
 * - Gradient underline for active nav links
 * - Motion-animated mobile menu with AnimatePresence
 * - Theme toggle with smooth icon transitions
 * - Scroll-aware transparency
 */

import { AnimatePresence, Motion } from 'motion-v'

const { brand } = useBrand()
const { isDark, toggleTheme } = useTheme()

const mobileMenuOpen = ref(false)

// Scroll-aware header transparency
const isScrolled = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Check initial state

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/book', label: 'Book' },
]

// Motion configs for mobile menu
const menuAnimation = { opacity: 1, height: 'auto', y: 0 }
const menuInitial = { opacity: 0, height: 0, y: -10 }
const menuExit = { opacity: 0, height: 0, y: -10 }
const menuTransition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

// Stagger animation for menu items
const getItemDelay = (index: number) => ({
  opacity: 1,
  x: 0,
  transition: { delay: 0.05 * index, duration: 0.2 },
})
const itemInitial = { opacity: 0, x: -10 }
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 backdrop-blur-lg transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-brand-background/50 shadow-sm shadow-brand-base/5'
        : 'bg-brand-background/80',
    ]"
  >
    <!-- Content fade gradient - fades content as it scrolls under header -->
    <div
      class="from-brand-background pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b to-transparent transition-opacity duration-300"
      :class="isScrolled ? 'opacity-100' : 'opacity-0'"
    />

    <nav class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
      <!-- Logo with gradient hover -->
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

      <!-- Desktop Nav with gradient active indicator -->
      <ul class="font-primary hidden items-center gap-6 md:flex">
        <li
          v-for="link in navLinks"
          :key="link.to"
          class="relative"
        >
          <NuxtLink
            :to="link.to"
            class="nav-link text-brand-muted hover:text-brand-accent py-1 transition-colors duration-200"
            active-class="nav-link-active text-brand-accent font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <!-- Theme Toggle with glow effect -->
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

        <!-- Mobile Menu Button -->
        <button
          class="text-brand-muted hover:text-brand-accent p-2 transition-colors md:hidden"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            class="h-6 w-6 transition-transform duration-200"
            :class="{ 'rotate-90': mobileMenuOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!mobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu with AnimatePresence -->
    <AnimatePresence>
      <Motion
        v-if="mobileMenuOpen"
        as="div"
        :initial="menuInitial"
        :animate="menuAnimation"
        :exit="menuExit"
        :transition="menuTransition"
        class="border-brand-base/10 bg-brand-background/90 overflow-hidden border-t backdrop-blur-lg md:hidden"
      >
        <ul class="font-primary space-y-1 px-4 py-3">
          <Motion
            v-for="(link, index) in navLinks"
            :key="link.to"
            as="li"
            :initial="itemInitial"
            :animate="getItemDelay(index)"
          >
            <NuxtLink
              :to="link.to"
              class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 block rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
              active-class="text-brand-accent bg-brand-accent/10 font-medium"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </Motion>
        </ul>
      </Motion>
    </AnimatePresence>
  </header>
</template>

<style scoped>
/* Gradient underline for active nav links */
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

.nav-link:hover::after,
.nav-link-active::after {
  transform: scaleX(1);
}

.nav-link-active::after {
  box-shadow: 0 0 8px var(--color-brand-glow);
}
</style>
