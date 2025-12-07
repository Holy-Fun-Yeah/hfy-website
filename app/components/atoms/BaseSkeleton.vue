<script setup lang="ts">
/**
 * BaseSkeleton - Loading placeholder component
 *
 * Displays an animated placeholder while content is loading.
 * Uses brand colors for consistent theming.
 *
 * @example
 * ```vue
 * <BaseSkeleton />
 * <BaseSkeleton h="2rem" w="200px" />
 * <BaseSkeleton variant="circle" h="3rem" w="3rem" />
 * <BaseSkeleton variant="text" lines="3" />
 * ```
 */

export type SkeletonVariant = 'default' | 'circle' | 'text'

interface Props {
  variant?: SkeletonVariant
  h?: string
  w?: string
  lines?: number // For text variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  h: '1rem',
  w: '100%',
  lines: 1,
})

const baseClasses = 'animate-pulse bg-brand-base/10'
</script>

<template>
  <!-- Text variant: multiple lines -->
  <div
    v-if="variant === 'text'"
    class="space-y-2"
  >
    <div
      v-for="i in lines"
      :key="i"
      :class="[baseClasses, 'rounded']"
      :style="{
        height: h,
        width: i === lines ? '70%' : w,
      }"
    />
  </div>

  <!-- Circle variant -->
  <div
    v-else-if="variant === 'circle'"
    :class="[baseClasses, 'rounded-full']"
    :style="{ height: h, width: w }"
  />

  <!-- Default rectangular -->
  <div
    v-else
    :class="[baseClasses, 'rounded-md']"
    :style="{ height: h, width: w }"
  />
</template>
