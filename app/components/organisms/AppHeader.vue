<script setup lang="ts">
const { brand } = useBrand()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="border-brand-base/10 bg-brand-neutral border-b">
    <nav class="container mx-auto flex items-center justify-between px-4 py-4">
      <NuxtLink
        to="/"
        class="font-logo text-brand-accent text-xl font-bold"
      >
        {{ brand.name }}
      </NuxtLink>

      <div class="flex items-center gap-6">
        <div class="font-primary flex gap-6">
          <NuxtLink
            to="/"
            class="text-brand-base/70 hover:text-brand-accent transition"
            active-class="text-brand-accent font-semibold"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-brand-base/70 hover:text-brand-accent transition"
            active-class="text-brand-accent font-semibold"
          >
            About
          </NuxtLink>
        </div>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="text-brand-base/70 hover:text-brand-accent hover:bg-brand-base/5 rounded-lg p-2 transition"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <!-- Sun icon (light mode) -->
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
          <!-- Moon icon (dark mode) -->
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
      </div>
    </nav>
  </header>
</template>
