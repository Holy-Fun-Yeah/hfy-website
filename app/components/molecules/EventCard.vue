<script setup lang="ts">
/**
 * EventCard - Event preview card with loading state
 *
 * Displays event information with built-in skeleton loading.
 * When loading=true, shows skeleton placeholders instead of content.
 *
 * @example
 * ```vue
 * <EventCard
 *   title="New Moon Meditation"
 *   date="Dec 3, 2025"
 *   location="Online"
 *   :to="'/events/123'"
 * />
 *
 * <!-- Loading state -->
 * <EventCard loading />
 * ```
 */

interface Props {
  title?: string
  date?: string
  location?: string
  to?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  date: undefined,
  location: undefined,
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
        w="40%"
      />
      <BaseSkeleton
        h="1.25rem"
        w="90%"
      />
      <BaseSkeleton
        h="0.875rem"
        w="60%"
      />
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
          v-if="date"
          class="text-brand-accent text-xs font-medium tracking-wide uppercase"
        >
          {{ date }}
        </p>
        <h3 class="font-headers text-brand-base font-semibold">
          {{ title }}
        </h3>
        <p
          v-if="location"
          class="text-brand-base/50 flex items-center gap-1 text-sm"
        >
          <svg
            class="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ location }}
        </p>
      </div>
    </BaseCard>
  </component>
</template>
