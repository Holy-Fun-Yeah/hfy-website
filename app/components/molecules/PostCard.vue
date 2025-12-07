<script setup lang="ts">
/**
 * PostCard - Blog post preview card with loading state
 *
 * Displays blog post information with built-in skeleton loading.
 * When loading=true, shows skeleton placeholders instead of content.
 *
 * @example
 * ```vue
 * <PostCard
 *   title="How planetary retrogrades help you grow"
 *   excerpt="Understanding the deeper purpose of retrograde seasons..."
 *   category="Astrology"
 *   :to="'/blog/retrogrades'"
 * />
 *
 * <!-- Loading state -->
 * <PostCard loading />
 * ```
 */

interface Props {
  title?: string
  excerpt?: string
  category?: string
  to?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  excerpt: undefined,
  category: undefined,
  to: undefined,
  loading: false,
})
</script>

<template>
  <!-- Loading skeleton -->
  <BaseCard
    v-if="loading"
    padding="md"
  >
    <div class="space-y-3">
      <BaseSkeleton
        h="0.75rem"
        w="25%"
      />
      <BaseSkeleton
        h="1.25rem"
        w="100%"
      />
      <div class="space-y-2">
        <BaseSkeleton
          h="0.875rem"
          w="100%"
        />
        <BaseSkeleton
          h="0.875rem"
          w="80%"
        />
      </div>
    </div>
  </BaseCard>

  <!-- Content -->
  <component
    :is="to ? 'NuxtLink' : 'div'"
    v-else
    :to="to"
    class="block"
  >
    <BaseCard
      hoverable
      padding="md"
      class="h-full"
    >
      <div class="space-y-2">
        <p
          v-if="category"
          class="text-brand-secondary text-xs font-medium uppercase tracking-wide"
        >
          {{ category }}
        </p>
        <h3 class="font-headers text-brand-base font-semibold leading-snug">
          {{ title }}
        </h3>
        <p
          v-if="excerpt"
          class="text-brand-base/60 line-clamp-2 text-sm"
        >
          {{ excerpt }}
        </p>
      </div>
    </BaseCard>
  </component>
</template>
