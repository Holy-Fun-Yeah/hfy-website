<script setup lang="ts">
const { brand } = useBrand()
const { isDark, toggleTheme } = useTheme()

const mobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/book', label: 'Book' },
]
</script>

<template>
  <header
    class="bg-brand-background/80 border-brand-base/10 sticky top-0 z-50 border-b backdrop-blur"
  >
    <nav class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="font-logo text-brand-accent text-xl font-bold"
      >
        {{ brand.name }}
      </NuxtLink>

      <!-- Desktop Nav -->
      <ul class="font-primary hidden items-center gap-6 md:flex">
        <li
          v-for="link in navLinks"
          :key="link.to"
        >
          <NuxtLink
            :to="link.to"
            class="text-brand-base/70 hover:text-brand-accent transition"
            active-class="text-brand-accent font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button
          type="button"
          class="text-brand-base/70 hover:text-brand-accent hover:bg-brand-base/5 rounded-lg p-2 transition"
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
          class="text-brand-base/70 hover:text-brand-accent p-2 md:hidden"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            class="h-6 w-6"
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

    <!-- Mobile Menu -->
    <Transition name="slide">
      <div
        v-if="mobileMenuOpen"
        class="border-brand-base/10 border-t px-4 pb-4 md:hidden"
      >
        <ul class="font-primary space-y-2 pt-2">
          <li
            v-for="link in navLinks"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="text-brand-base/70 hover:text-brand-accent block py-2 text-lg transition"
              active-class="text-brand-accent font-medium"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
