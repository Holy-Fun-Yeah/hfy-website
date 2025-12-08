<script setup lang="ts">
/**
 * PageSection - Page section with scroll-reveal animation
 *
 * A container for page sections with eyebrow, title, description,
 * and flexible content slot. Uses brand typography and whileInView
 * for scroll-triggered fade-up animation.
 *
 * @example
 * ```vue
 * <PageSection title="Features" description="What we offer">
 *   <div class="grid grid-cols-3 gap-4">...</div>
 * </PageSection>
 *
 * <PageSection eyebrow="About" title="Our Story" centered>
 *   <p>Content here...</p>
 * </PageSection>
 *
 * <!-- Disable animation for hero sections -->
 * <PageSection title="Hero" :animate="false">...</PageSection>
 * ```
 */

import { Motion } from 'motion-v'

export type SectionWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type SectionSpacing = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    description?: string
    width?: SectionWidth
    spacing?: SectionSpacing
    centered?: boolean
    divider?: boolean
    animate?: boolean
  }>(),
  {
    eyebrow: undefined,
    title: undefined,
    description: undefined,
    width: 'lg',
    spacing: 'md',
    centered: false,
    divider: false,
    animate: true,
  }
)

const widthClasses: Record<SectionWidth, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}

const spacingClasses: Record<SectionSpacing, string> = {
  sm: 'py-8',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
}

// Motion animation config for scroll reveal
const revealAnimation = { opacity: 1, y: 0 }
const initialState = { opacity: 0, y: 30 }
const transitionConfig = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
</script>

<template>
  <section :class="[spacingClasses[spacing], { 'border-brand-base/10 border-b': divider }]">
    <div :class="['mx-auto px-4 sm:px-6', widthClasses[width], { 'text-center': centered }]">
      <!-- Header with scroll-reveal animation -->
      <Motion
        v-if="eyebrow || title || description"
        as="header"
        :initial="animate ? initialState : undefined"
        :while-in-view="animate ? revealAnimation : undefined"
        :transition="transitionConfig"
        :viewport="{ once: true, margin: '-100px' }"
        :class="['mb-8', { 'mx-auto max-w-2xl': centered }]"
      >
        <!-- Eyebrow with gradient text option -->
        <p
          v-if="eyebrow"
          class="mb-2 text-sm font-semibold tracking-wider uppercase"
        >
          <span class="bg-gradient-to-r from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end bg-clip-text text-transparent">
            {{ eyebrow }}
          </span>
        </p>
        <h2
          v-if="title"
          class="font-headers text-brand-base mb-3 text-3xl font-bold md:text-4xl"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="text-brand-muted text-lg"
        >
          {{ description }}
        </p>
      </Motion>

      <!-- Content -->
      <slot />
    </div>
  </section>
</template>
