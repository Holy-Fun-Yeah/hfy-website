<script setup lang="ts">
/**
 * AmbientBackground - Ethereal floating orbs and particles
 *
 * Creates an immersive atmosphere with:
 * - Floating gradient orbs that drift slowly (full rainbow spectrum)
 * - Golden star particles and shimmer effects
 * - Cosmic depth with varied colors
 *
 * @example
 * ```vue
 * <AmbientBackground />
 * <AmbientBackground :intensity="'high'" />
 * <AmbientBackground :orbs="5" :particles="true" :stars="true" />
 * ```
 */

import { Motion } from 'motion-v'

interface Props {
  intensity?: 'low' | 'medium' | 'high'
  orbs?: number
  particles?: boolean
  stars?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 'medium',
  orbs: 4,
  particles: true,
  stars: true,
})

// Full RAINBOW color palette for orbs - Pride flag spectrum
const orbColors = [
  { from: 'rgba(239, 68, 68, 0.4)', to: 'rgba(249, 115, 22, 0.25)' }, // Red-Orange
  { from: 'rgba(249, 115, 22, 0.4)', to: 'rgba(234, 179, 8, 0.25)' }, // Orange-Yellow
  { from: 'rgba(234, 179, 8, 0.4)', to: 'rgba(34, 197, 94, 0.25)' }, // Yellow-Green
  { from: 'rgba(34, 197, 94, 0.4)', to: 'rgba(59, 130, 246, 0.25)' }, // Green-Blue
  { from: 'rgba(59, 130, 246, 0.4)', to: 'rgba(139, 92, 246, 0.25)' }, // Blue-Purple
  { from: 'rgba(139, 92, 246, 0.4)', to: 'rgba(239, 68, 68, 0.25)' }, // Purple-Red
]

// Generate orb configurations with varied sizes and positions
const orbConfigs = computed(() => {
  const configs = []
  const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[props.intensity]

  for (let i = 0; i < props.orbs; i++) {
    const colorIndex = i % orbColors.length
    configs.push({
      id: i,
      size: 200 + Math.random() * 300 * intensityMultiplier,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 5,
      colors: orbColors[colorIndex],
    })
  }
  return configs
})

// Particle positions for shimmer effect - Full RAINBOW with white sparkles
const particleCount = computed(() => (props.particles ? 40 : 0))
const particleColors = [
  'rgba(255, 255, 255, 0.95)', // White sparkle
  'rgba(239, 68, 68, 0.85)', // Red
  'rgba(249, 115, 22, 0.85)', // Orange
  'rgba(234, 179, 8, 0.9)', // Yellow
  'rgba(34, 197, 94, 0.85)', // Green
  'rgba(59, 130, 246, 0.85)', // Blue
  'rgba(139, 92, 246, 0.85)', // Purple
  'rgba(255, 255, 255, 0.9)', // White sparkle
]

const particles = computed(() =>
  Array.from({ length: particleCount.value }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5,
    color: particleColors[i % particleColors.length],
  }))
)

// Golden star particles - more visible
const starCount = computed(() => (props.stars ? 25 : 0))
const starParticles = computed(() =>
  Array.from({ length: starCount.value }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 8 + Math.random() * 12,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 8,
    rotation: Math.random() * 360,
  }))
)
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <!-- Floating rainbow orbs -->
    <Motion
      v-for="orb in orbConfigs"
      :key="orb.id"
      as="div"
      :initial="{ x: `${orb.x}%`, y: `${orb.y}%`, scale: 0.8, opacity: 0 }"
      :animate="{
        x: [`${orb.x}%`, `${(orb.x + 20) % 100}%`, `${orb.x}%`],
        y: [`${orb.y}%`, `${(orb.y + 15) % 100}%`, `${orb.y}%`],
        scale: [0.8, 1.1, 0.8],
        opacity: [0.5, 0.7, 0.5],
      }"
      :transition="{
        duration: orb.duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: orb.delay,
      }"
      class="absolute rounded-full blur-3xl"
      :style="{
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        transform: `translate(-50%, -50%)`,
        background: `radial-gradient(circle at center, ${orb.colors?.from ?? 'transparent'}, ${orb.colors?.to ?? 'transparent'}, transparent 70%)`,
      }"
    />

    <!-- Rainbow shimmer particles -->
    <Motion
      v-for="particle in particles"
      :key="`p-${particle.id}`"
      as="div"
      :initial="{ opacity: 0, scale: 0 }"
      :animate="{
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
      }"
      :transition="{
        duration: particle.duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: particle.delay,
      }"
      class="absolute rounded-full"
      :style="{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
      }"
    />

    <!-- Golden star particles -->
    <Motion
      v-for="star in starParticles"
      :key="`star-${star.id}`"
      as="div"
      :initial="{ opacity: 0, scale: 0, rotate: star.rotation }"
      :animate="{
        opacity: [0, 1, 0.8, 1, 0],
        scale: [0, 1, 0.9, 1.1, 0],
        rotate: [star.rotation, star.rotation + 180],
      }"
      :transition="{
        duration: star.duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: star.delay,
      }"
      class="star-shape absolute"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
      }"
    />

    <!-- Subtle noise overlay for texture -->
    <div class="bg-noise absolute inset-0 opacity-[0.015]" />
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

/* Golden star shape using clip-path - VIVID with strong glow */
.star-shape {
  background: linear-gradient(135deg, #fff 0%, #ffd700 30%, #ffaa00 60%, #ff8c00 100%);
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
}
</style>
