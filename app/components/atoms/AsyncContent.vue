<script setup lang="ts">
/**
 * AsyncContent - Wrapper for async content with loading/empty/error states
 *
 * Provides a consistent pattern for handling async data loading.
 * Shows loading state immediately, then transitions to content.
 *
 * @example
 * ```vue
 * <AsyncContent :loading="pending" :error="error" :empty="!data?.length">
 *   <div v-for="item in data">{{ item }}</div>
 *
 *   <template #loading>
 *     <MySkeleton v-for="i in 3" :key="i" />
 *   </template>
 *
 *   <template #empty>
 *     <EmptyState title="No items yet" />
 *   </template>
 * </AsyncContent>
 * ```
 */

interface Props {
  loading?: boolean
  error?: Error | null
  empty?: boolean
  minHeight?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  empty: false,
  minHeight: undefined,
})
</script>

<template>
  <div :style="minHeight ? { minHeight } : undefined">
    <!-- Error state -->
    <div
      v-if="error"
      class="text-brand-accent/80 py-8 text-center"
    >
      <p class="mb-2 text-sm font-medium">Something went wrong</p>
      <p class="text-brand-base/50 text-xs">{{ error.message }}</p>
    </div>

    <!-- Loading state -->
    <Transition
      v-else-if="loading"
      name="fade"
      mode="out-in"
    >
      <div>
        <slot name="loading">
          <div class="space-y-4">
            <BaseSkeleton
              v-for="i in 3"
              :key="i"
              h="4rem"
            />
          </div>
        </slot>
      </div>
    </Transition>

    <!-- Empty state -->
    <div v-else-if="empty">
      <slot name="empty">
        <EmptyState />
      </slot>
    </div>

    <!-- Content -->
    <Transition
      v-else
      name="fade"
      mode="out-in"
    >
      <div>
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
