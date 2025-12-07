<script setup lang="ts">
/**
 * PageSection - Page section with optional header
 *
 * A container for page sections with eyebrow, title, description,
 * and flexible content slot. Uses brand typography.
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
 * ```
 */

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
  }>(),
  {
    eyebrow: undefined,
    title: undefined,
    description: undefined,
    width: 'lg',
    spacing: 'md',
    centered: false,
    divider: false,
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
</script>

<template>
  <section :class="[spacingClasses[spacing], { 'border-brand-base/10 border-b': divider }]">
    <div :class="['mx-auto px-4 sm:px-6', widthClasses[width], { 'text-center': centered }]">
      <!-- Header -->
      <header
        v-if="eyebrow || title || description"
        :class="['mb-8', { 'mx-auto max-w-2xl': centered }]"
      >
        <p
          v-if="eyebrow"
          class="text-brand-accent mb-2 text-sm font-medium tracking-wider uppercase"
        >
          {{ eyebrow }}
        </p>
        <h2
          v-if="title"
          class="font-headers text-brand-base mb-3 text-3xl font-bold md:text-4xl"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="text-brand-base/70 text-lg"
        >
          {{ description }}
        </p>
      </header>

      <!-- Content -->
      <slot />
    </div>
  </section>
</template>
