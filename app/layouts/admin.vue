<script setup lang="ts">
/**
 * Admin Layout - Simplified layout for admin pages
 *
 * Features:
 * - No footer
 * - Simplified header with "HFY! Editor" branding
 * - Navigation to editable sections (About, Blog, Events)
 * - Clean background without ethereal effects
 */

import { AnimatePresence, Motion } from 'motion-v'

const route = useRoute()

// Page transition config
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}
</script>

<template>
  <div
    class="bg-brand-background relative flex min-h-screen flex-col overflow-x-hidden transition-colors duration-200"
  >
    <AdminHeader />

    <!-- Spacer for fixed header -->
    <div class="h-14" />

    <main class="relative z-10 flex-1">
      <AnimatePresence mode="wait">
        <Motion
          :key="route.path"
          as="div"
          :initial="pageTransition.initial"
          :animate="pageTransition.animate"
          :exit="pageTransition.exit"
          :transition="pageTransition.transition"
        >
          <slot />
        </Motion>
      </AnimatePresence>
    </main>
  </div>
</template>
