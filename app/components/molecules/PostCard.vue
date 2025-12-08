<script setup lang="ts">
/**
 * PostCard - Blog post preview with prismatic hover effects
 *
 * Displays blog post information with scroll-reveal animation and prismatic hover state.
 * Uses whileInView for scroll-triggered reveal animation.
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

import { Motion } from 'motion-v'

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

// Motion animation config for scroll reveal
const revealAnimation = { opacity: 1, y: 0 }
const initialState = { opacity: 0, y: 20 }
const transitionConfig = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}
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
      class="group block"
    >
      <BaseCard
        hoverable
        padding="md"
        class="h-full"
      >
        <div class="space-y-2">
          <!-- Category badge with lava lamp effect -->
          <div
            v-if="category"
            class="inline-flex"
          >
            <span class="badge-lava relative overflow-hidden rounded-full px-3 py-0.5 text-xs font-semibold tracking-wide text-white uppercase">
              {{ category }}
            </span>
          </div>

          <!-- Title with hover color transition -->
          <h3
            class="font-headers text-brand-base group-hover:text-brand-accent leading-snug font-semibold transition-colors"
          >
            {{ title }}
          </h3>

          <!-- Excerpt -->
          <p
            v-if="excerpt"
            class="text-brand-muted line-clamp-2 text-sm leading-relaxed"
          >
            {{ excerpt }}
          </p>

          <!-- Read more indicator -->
          <div
            class="text-brand-accent flex items-center gap-1 pt-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span>Read more</span>
            <svg
              class="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </BaseCard>
    </component>
  </Motion>
</template>

<style scoped>
/* Lava lamp effect for category badge */
.badge-lava {
  background: linear-gradient(
    90deg,
    var(--color-brand-gradient-start),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-end),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-start)
  );
  background-size: 300% 100%;
  animation: lava-flow 4s ease-in-out infinite;
}

@keyframes lava-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Subtle glow on hover */
.group:hover .badge-lava {
  box-shadow:
    0 0 12px var(--color-brand-gradient-start),
    0 0 20px var(--color-brand-gradient-middle);
  animation-duration: 2s;
}
</style>
