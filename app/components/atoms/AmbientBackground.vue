<script setup lang="ts">
/**
 * AmbientBackground - Ethereal floating orbs and particles
 *
 * Creates an immersive atmosphere with:
 * - Floating gradient orbs that drift slowly
 * - Subtle particle shimmer effects
 * - Responds to theme (warmer in light, cooler in dark)
 *
 * @example
 * ```vue
 * <AmbientBackground />
 * <AmbientBackground :intensity="'high'" />
 * <AmbientBackground :orbs="5" :particles="true" />
 * ```
 */

import { Motion } from 'motion-v'

interface Props {
  intensity?: 'low' | 'medium' | 'high'
  orbs?: number
  particles?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 'medium',
  orbs: 3,
  particles: true,
})

// Generate orb configurations with varied sizes and positions
const orbConfigs = computed(() => {
  const configs = []
  const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[props.intensity]

  for (let i = 0; i < props.orbs; i++) {
    configs.push({
      id: i,
      size: 200 + Math.random() * 300 * intensityMultiplier,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 5,
      gradient: i % 3, // 0: pink-violet, 1: violet-cyan, 2: cyan-pink
    })
  }
  return configs
})

// Particle positions for shimmer effect
const particleCount = computed(() => (props.particles ? 20 : 0))
const particles = computed(() =>
  Array.from({ length: particleCount.value }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5,
  }))
)

const gradientClasses = [
  'from-brand-gradient-start/30 to-brand-gradient-middle/20',
  'from-brand-gradient-middle/30 to-brand-gradient-end/20',
  'from-brand-gradient-end/30 to-brand-gradient-start/20',
]
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <!-- Floating orbs -->
    <Motion
      v-for="orb in orbConfigs"
      :key="orb.id"
      as="div"
      :initial="{ x: `${orb.x}%`, y: `${orb.y}%`, scale: 0.8, opacity: 0 }"
      :animate="{
        x: [`${orb.x}%`, `${(orb.x + 20) % 100}%`, `${orb.x}%`],
        y: [`${orb.y}%`, `${(orb.y + 15) % 100}%`, `${orb.y}%`],
        scale: [0.8, 1.1, 0.8],
        opacity: [0.4, 0.6, 0.4],
      }"
      :transition="{
        duration: orb.duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: orb.delay,
      }"
      class="absolute rounded-full blur-3xl"
      :class="['bg-gradient-radial', gradientClasses[orb.gradient]]"
      :style="{
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        transform: `translate(-50%, -50%)`,
      }"
    />

    <!-- Shimmer particles -->
    <Motion
      v-for="particle in particles"
      :key="`p-${particle.id}`"
      as="div"
      :initial="{ opacity: 0, scale: 0 }"
      :animate="{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }"
      :transition="{
        duration: particle.duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: particle.delay,
      }"
      class="bg-brand-accent/60 absolute rounded-full"
      :style="{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
      }"
    />

    <!-- Subtle noise overlay for texture -->
    <div class="bg-noise absolute inset-0 opacity-[0.02]" />
  </div>
</template>

<style scoped>
.bg-gradient-radial {
  background: radial-gradient(
    circle at center,
    var(--tw-gradient-from),
    var(--tw-gradient-to),
    transparent 70%
  );
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>
