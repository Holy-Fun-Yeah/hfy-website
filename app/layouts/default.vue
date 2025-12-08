<script setup lang="ts">
/**
 * Default Layout - Ethereal wrapper with ambient effects
 *
 * Features:
 * - Ambient floating orbs background
 * - Page transition animations
 * - Brand-aware styling
 */

import { AnimatePresence, Motion } from 'motion-v'

const route = useRoute()

// Page transition config
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}
</script>

<template>
  <div class="bg-brand-background relative flex min-h-screen flex-col transition-colors duration-200">
    <!-- Ethereal ambient background with rainbow orbs and stars -->
    <AmbientBackground :orbs="5" intensity="medium" :particles="true" :stars="true" />

    <!-- Scroll-reactive gradient overlay on edges -->
    <ScrollGradientOverlay :intensity="0.1" position="edges" />

    <!-- Continuous energy threads along margins (spans full page) - String theory style -->
    <EnergyThreads side="both" :threads="3" intensity="medium" :animated="true" />

    <!-- Sacred geometry floating elements - more visible -->
    <SacredGeometry
      pattern="flowerOfLife"
      position="top-left"
      :size="600"
      :opacity="0.07"
      :rotate="true"
      color="gradient"
    />
    <SacredGeometry
      pattern="metatron"
      position="bottom-right"
      :size="550"
      :opacity="0.06"
      :rotate="true"
      color="gradient"
    />
    <SacredGeometry
      pattern="spiral"
      position="top-right"
      :size="400"
      :opacity="0.05"
      :rotate="true"
      color="gold"
    />

    <AppHeader />

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

    <AppFooter />
  </div>
</template>
