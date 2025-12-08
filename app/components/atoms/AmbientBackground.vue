<script setup lang="ts">
/**
 * AmbientBackground - Ethereal floating orbs and particles
 *
 * Creates an immersive atmosphere with:
 * - Floating gradient orbs that drift slowly (full rainbow spectrum)
 * - Golden star particles and shimmer effects
 * - CSS animations for performance (no Motion.js)
 *
 * LAZY LOADED: Renders after initial layout
 * Colors from ~/config/visuals.ts for consistency
 */

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

// Theme-aware visual colors
const { orbColors, particleColors, starGradient, starGlow } = useVisuals()

// Lazy load
const isLoaded = ref(false)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  // Delay rendering for faster initial paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isLoaded.value = true
    })
  })
})

// Pre-computed orb configs
const orbConfigs = computed(() => {
  const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[props.intensity]
  const count = isMobile.value ? Math.min(props.orbs, 3) : props.orbs

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 200 + i * 100 * intensityMultiplier,
    x: 10 + ((i * 22) % 80),
    y: 5 + ((i * 28) % 90),
    duration: 20 + i * 5,
    delay: i * 2,
    colors: orbColors.value[i % orbColors.value.length],
  }))
})

// Rainbow shimmer particles
const particleCount = computed(() => {
  if (!props.particles) return 0
  return isMobile.value ? 15 : 35
})

const particles = computed(() =>
  Array.from({ length: particleCount.value }, (_, i) => ({
    id: i,
    x: (i * 19) % 100,
    y: (i * 23) % 100,
    size: 2 + (i % 4),
    duration: 3 + (i % 5),
    delay: (i % 10) * 0.5,
    color: particleColors.value[i % particleColors.value.length],
  }))
)

// Golden star particles - MORE and BIGGER per user request
const starCount = computed(() => {
  if (!props.stars) return 0
  return isMobile.value ? 20 : 45
})

const starParticles = computed(() =>
  Array.from({ length: starCount.value }, (_, i) => ({
    id: i,
    x: (i * 17 + 7) % 100,
    y: (i * 29 + 11) % 100,
    size: 10 + (i % 6) * 4, // Bigger: 10-30px
    duration: 2.5 + (i % 4),
    delay: (i % 12) * 0.8,
  }))
)

const opacityMap = { low: 0.6, medium: 0.8, high: 1 }
</script>

<template>
  <div
    v-if="isLoaded"
    class="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    :style="{ opacity: opacityMap[intensity] }"
  >
    <!-- Floating rainbow orbs - CSS animations -->
    <div
      v-for="orb in orbConfigs"
      :key="orb.id"
      class="orb absolute rounded-full will-change-transform"
      :style="{
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        background: `radial-gradient(circle at center, ${orb.colors?.from}, ${orb.colors?.to}, transparent 70%)`,
        filter: 'blur(40px)',
        animationDuration: `${orb.duration}s`,
        animationDelay: `${orb.delay}s`,
      }"
    />

    <!-- Shimmer particles - CSS animations -->
    <div
      v-for="particle in particles"
      :key="`p-${particle.id}`"
      class="particle absolute rounded-full will-change-transform"
      :style="{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        animationDuration: `${particle.duration}s`,
        animationDelay: `${particle.delay}s`,
      }"
    />

    <!-- Golden star particles - MORE and BIGGER -->
    <div
      v-for="star in starParticles"
      :key="`star-${star.id}`"
      class="star star-shape absolute will-change-transform"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        background: starGradient,
        filter: starGlow,
        animationDuration: `${star.duration}s`,
        animationDelay: `${star.delay}s`,
      }"
    />

    <!-- Subtle noise overlay -->
    <div class="bg-noise absolute inset-0 opacity-[0.012]" />
  </div>
</template>

<style scoped>
/* GPU-accelerated orb animation */
.orb {
  animation: float-orb 20s ease-in-out infinite;
  transform: translateZ(0);
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate(0, 0) scale(0.9);
    opacity: 0.5;
  }
  25% {
    transform: translate(5%, 3%) scale(1);
    opacity: 0.65;
  }
  50% {
    transform: translate(8%, 6%) scale(1.05);
    opacity: 0.7;
  }
  75% {
    transform: translate(3%, 4%) scale(0.95);
    opacity: 0.6;
  }
}

/* Particle twinkle animation */
.particle {
  animation: twinkle 4s ease-in-out infinite;
  transform: translateZ(0);
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Star sparkle animation */
.star {
  animation: sparkle 3s ease-in-out infinite;
  transform: translateZ(0);
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(90deg);
  }
}

/* Star shape - colors set via inline style from useVisuals() */
.star-shape {
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
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
