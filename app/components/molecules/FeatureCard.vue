<script setup lang="ts">
/**
 * FeatureCard - Feature showcase with holographic accents
 *
 * Displays feature information with icon, glowing effects, and motion animation.
 * Uses whileInView for scroll-triggered reveal animation.
 *
 * @example
 * ```vue
 * <FeatureCard
 *   title="Personalized Insights"
 *   description="Discover your cosmic blueprint..."
 *   icon="bolt"
 *   color="accent"
 * />
 * ```
 */

import { Motion } from 'motion-v'

defineProps<{
  title: string
  description: string
  icon: 'palette' | 'database' | 'shield' | 'bolt' | 'code' | 'star' | 'heart' | 'sparkles'
  color?: 'accent' | 'secondary' | 'contrast'
}>()

const iconPaths = {
  palette:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  database:
    'M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c-1.29 1.03-3.67 2-8 2S5.29 10.03 4 9zm0 5v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c-1.29 1.03-3.67 2-8 2s-6.71-.97-8-2z',
  shield:
    'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  heart:
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  sparkles:
    'M12 3L14 9L20 11L14 13L12 19L10 13L4 11L10 9L12 3ZM18 3L19 6L22 7L19 8L18 11L17 8L14 7L17 6L18 3Z',
}

const colorClasses = {
  accent: {
    bg: 'bg-brand-accent/10',
    text: 'text-brand-accent',
    glow: 'group-hover:shadow-[0_0_20px_var(--color-brand-glow)]',
  },
  secondary: {
    bg: 'bg-brand-secondary/10',
    text: 'text-brand-secondary',
    glow: 'group-hover:shadow-[0_0_20px_rgba(0,172,193,0.3)]',
  },
  contrast: {
    bg: 'bg-brand-contrast/10',
    text: 'text-brand-contrast',
    glow: 'group-hover:shadow-[0_0_20px_rgba(249,168,37,0.3)]',
  },
}

// Motion animation config for scroll reveal
const revealAnimation = { opacity: 1, y: 0 }
const initialState = { opacity: 0, y: 20 }
const transitionConfig = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
</script>

<template>
  <Motion
    as="div"
    :initial="initialState"
    :while-in-view="revealAnimation"
    :transition="transitionConfig"
    :viewport="{ once: true, margin: '-50px' }"
    class="group"
  >
    <div
      class="bg-brand-neutral border-brand-base/10 rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-brand-glow)] hover:-translate-y-1"
    >
      <!-- Icon with glow effect -->
      <div
        class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300"
        :class="[colorClasses[color ?? 'accent'].bg, colorClasses[color ?? 'accent'].glow]"
      >
        <svg
          class="h-7 w-7 transition-transform duration-300 group-hover:scale-110"
          :class="colorClasses[color ?? 'accent'].text"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path :d="iconPaths[icon]" />
        </svg>
      </div>

      <!-- Content -->
      <h3 class="font-headers text-brand-base mb-2 text-lg font-semibold">{{ title }}</h3>
      <p class="text-brand-muted leading-relaxed">{{ description }}</p>
    </div>
  </Motion>
</template>
