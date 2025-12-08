<script setup lang="ts">
/**
 * EventCard - Event preview with warm gradients and motion
 *
 * Displays event information with scroll-reveal animation and warm hover effects.
 * Uses whileInView for scroll-triggered reveal animation.
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

import { Motion } from 'motion-v'

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

// Motion animation config for scroll reveal
const revealAnimation = { opacity: 1, y: 0 }
const initialState = { opacity: 0, y: 20 }
const transitionConfig = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
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

  <!-- Content with motion -->
  <Motion
    v-else
    as="div"
    :initial="initialState"
    :while-in-view="revealAnimation"
    :transition="transitionConfig"
    :viewport="{ once: true, margin: '-50px' }"
  >
    <component
      :is="to ? 'NuxtLink' : 'div'"
      :to="to"
      class="block group"
    >
      <BaseCard
        hoverable
        padding="md"
        class="h-full"
      >
        <div class="space-y-2">
          <!-- Date badge with gradient accent -->
          <div
            v-if="date"
            class="inline-flex items-center gap-1.5"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-middle" />
            <p class="text-brand-accent text-xs font-semibold tracking-wide uppercase">
              {{ date }}
            </p>
          </div>

          <!-- Title -->
          <h3 class="font-headers text-brand-base font-semibold transition-colors group-hover:text-brand-accent">
            {{ title }}
          </h3>

          <!-- Location -->
          <p
            v-if="location"
            class="text-brand-muted flex items-center gap-1.5 text-sm"
          >
            <svg
              class="h-4 w-4 text-brand-secondary"
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
  </Motion>
</template>
