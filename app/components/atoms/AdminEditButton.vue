<script setup lang="ts">
/**
 * AdminEditButton - Floating edit button for admin users
 *
 * Only renders when:
 * - Running in browser (not SSR)
 * - User is logged in as admin
 * - Current route is an editable content page
 *
 * @example
 * ```vue
 * <AdminEditButton />
 * ```
 */

import { motion } from 'motion-v'

import { isEditableRoute } from '~/config/admin'

const { isAdmin } = useAuth()
const route = useRoute()
const { t } = useLocale()

// Only show on editable routes and when user is admin
const shouldShow = computed(() => {
  if (!import.meta.client) return false
  if (!isAdmin.value) return false
  return isEditableRoute(route.path)
})
</script>

<template>
  <Teleport to="body">
    <motion.div
      v-if="shouldShow"
      :initial="{ opacity: 0, scale: 0.8, y: 20 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
      class="fixed right-6 bottom-6 z-50"
    >
      <NuxtLink
        to="/admin/editor"
        class="bg-brand-accent hover:bg-brand-accent/90 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_var(--color-brand-glow)]"
        :title="t('admin.editButton')"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </NuxtLink>
    </motion.div>
  </Teleport>
</template>
