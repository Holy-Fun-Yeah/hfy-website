<script setup lang="ts">
/**
 * EmptyState - Placeholder for empty content areas
 *
 * Displays a friendly message when content is not yet available.
 * Uses brand colors and typography.
 *
 * @example
 * ```vue
 * <EmptyState />
 * <EmptyState
 *   icon="sparkles"
 *   title="No events yet"
 *   description="Check back soon for upcoming cosmic gatherings."
 * >
 *   <BaseButton>Create Event</BaseButton>
 * </EmptyState>
 * ```
 */

interface Props {
  icon?: string
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: '✨',
  title: 'Nothing here yet',
  description: 'Content will appear here once it becomes available.',
})
</script>

<template>
  <div class="py-12 text-center">
    <div class="mb-4 text-4xl">{{ icon }}</div>
    <h3 class="font-headers text-brand-base mb-2 text-xl font-semibold">
      {{ title }}
    </h3>
    <p class="text-brand-base/60 mx-auto max-w-sm">
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-6"
    >
      <slot />
    </div>
  </div>
</template>
