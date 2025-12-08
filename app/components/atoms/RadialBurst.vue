<script setup lang="ts">
/**
 * RadialBurst - Radiating light rays SVG decoration
 *
 * Creates a sunburst effect with animated rays emanating from center.
 * Inspired by spiritual/cosmic imagery with golden light energy.
 *
 * @example
 * ```vue
 * <RadialBurst />
 * <RadialBurst :rays="24" color="rainbow" :intensity="0.3" />
 * <RadialBurst :rays="12" color="gold" :pulse="true" />
 * ```
 */

interface Props {
  rays?: number
  color?: 'rainbow' | 'gold' | 'brand'
  intensity?: number // 0-1 opacity
  pulse?: boolean
  size?: number // percentage of container
}

const props = withDefaults(defineProps<Props>(), {
  rays: 16,
  color: 'rainbow',
  intensity: 0.15,
  pulse: true,
  size: 120,
})

// Generate ray paths
const rayPaths = computed(() => {
  const paths = []
  const angleStep = 360 / props.rays

  for (let i = 0; i < props.rays; i++) {
    const angle = i * angleStep
    const length = 50 + (i % 2) * 15 // Alternating lengths
    paths.push({
      id: i,
      angle,
      length,
      delay: i * 0.1,
    })
  }
  return paths
})

// Gradient stops based on color prop - Full RAINBOW pride spectrum
const gradientStops = computed(() => {
  switch (props.color) {
    case 'rainbow':
      return [
        { offset: '0%', color: '#ef4444' }, // Red
        { offset: '17%', color: '#f97316' }, // Orange
        { offset: '33%', color: '#eab308' }, // Yellow
        { offset: '50%', color: '#22c55e' }, // Green
        { offset: '67%', color: '#3b82f6' }, // Blue
        { offset: '83%', color: '#8b5cf6' }, // Purple
        { offset: '100%', color: '#ef4444' }, // Back to red
      ]
    case 'gold':
      return [
        { offset: '0%', color: '#ffffff' }, // White center
        { offset: '30%', color: '#ffd700' }, // Gold
        { offset: '70%', color: '#ffaa00' },
        { offset: '100%', color: '#ff8c00' },
      ]
    case 'brand':
      return [
        { offset: '0%', color: 'var(--color-brand-accent)' },
        { offset: '100%', color: 'var(--color-brand-secondary)' },
      ]
    default:
      return []
  }
})
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    :style="{ opacity: intensity }"
  >
    <svg
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      :class="{ 'animate-spin-slow': pulse }"
      :style="{ width: `${size}%`, height: `${size}%` }"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <!-- Radial gradient for center glow - VIVID golden white -->
        <radialGradient id="centerGlow">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="20%" stop-color="#ffd700" stop-opacity="0.6" />
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
        </radialGradient>

        <!-- Linear gradient for rays -->
        <linearGradient
          id="rayGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            v-for="(stop, idx) in gradientStops"
            :key="idx"
            :offset="stop.offset"
            :stop-color="stop.color"
            stop-opacity="0.6"
          />
        </linearGradient>

        <!-- Animated gradient for rainbow effect - Pride flag cycling -->
        <linearGradient
          id="animatedRayGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9">
            <animate
              attributeName="stop-color"
              values="#ef4444;#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6;#ef4444"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="40%" stop-color="#22c55e" stop-opacity="0.7">
            <animate
              attributeName="stop-color"
              values="#22c55e;#3b82f6;#8b5cf6;#ef4444;#f97316;#eab308;#22c55e"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="transparent" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Center glow -->
      <circle
        cx="50"
        cy="50"
        r="15"
        fill="url(#centerGlow)"
        class="animate-pulse-slow"
      />

      <!-- Radiating rays -->
      <g class="rays">
        <line
          v-for="ray in rayPaths"
          :key="ray.id"
          x1="50"
          y1="50"
          :x2="50 + ray.length * Math.cos((ray.angle * Math.PI) / 180)"
          :y2="50 + ray.length * Math.sin((ray.angle * Math.PI) / 180)"
          stroke="url(#animatedRayGradient)"
          :stroke-width="ray.id % 2 === 0 ? 0.5 : 0.25"
          stroke-linecap="round"
          :style="{ animationDelay: `${ray.delay}s` }"
          class="ray-line"
        />
      </g>

      <!-- Outer ring pulses -->
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="url(#rayGradient)"
        stroke-width="0.2"
        class="animate-ping-slow"
        style="opacity: 0.3"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#rayGradient)"
        stroke-width="0.15"
        class="animate-ping-slow"
        style="opacity: 0.2; animation-delay: 1s"
      />
    </svg>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 60s linear infinite;
}

.animate-pulse-slow {
  animation: pulse-glow 4s ease-in-out infinite;
}

.animate-ping-slow {
  animation: ping-expand 4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes ping-expand {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.ray-line {
  animation: ray-pulse 3s ease-in-out infinite;
}

@keyframes ray-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>
