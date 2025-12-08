<script setup lang="ts">
/**
 * RadialBurst - Radiating light rays SVG decoration
 *
 * Creates a sunburst effect with animated rays emanating from center.
 * Inspired by spiritual/cosmic imagery with golden light energy.
 *
 * LAZY LOADED: Renders after initial layout for better performance
 * Colors from ~/config/visuals.ts for consistency
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

// Theme-aware visual colors
const { colors, rainbow, rainbowStops, goldStops, getShiftedRainbowValues } = useVisuals()

// Lazy load
const isLoaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isLoaded.value = true
    })
  })
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

// Rainbow stops for circular gradient (loops back to start)
const rainbowCircularStops = computed(() => {
  const stops = rainbowStops.value
  return [
    ...stops,
    { offset: '100%', color: stops[0]?.color || colors.value.rainbow.red },
  ]
})

// Gradient stops based on color prop
const gradientStops = computed(() => {
  switch (props.color) {
    case 'rainbow':
      return rainbowCircularStops.value
    case 'gold':
      return goldStops.value
    case 'brand':
      return [
        { offset: '0%', color: 'var(--color-brand-accent)' },
        { offset: '100%', color: 'var(--color-brand-secondary)' },
      ]
    default:
      return []
  }
})

// Animation values for rainbow cycling
const rainbowAnimationValues = computed(() => rainbow.value.join(';') + ';' + rainbow.value[0])

// Center glow colors (theme-aware)
const centerGlowStops = computed(() => [
  { offset: '0%', color: colors.value.gold.white, opacity: 1 },
  { offset: '20%', color: colors.value.gold.light, opacity: 0.6 },
  { offset: '50%', color: colors.value.rainbow.purple, opacity: 0.3 },
  { offset: '100%', color: colors.value.accents.violet, opacity: 0 },
])

const instanceId = Math.random().toString(36).substring(7)
</script>

<template>
  <div
    v-if="isLoaded"
    class="pointer-events-none absolute inset-0 overflow-hidden"
    :style="{ opacity: intensity }"
  >
    <svg
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      :class="{ 'animate-spin-slow': pulse }"
      :style="{ width: `${size}%`, height: `${size}%` }"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <!-- Radial gradient for center glow (theme-aware) -->
        <radialGradient :id="`centerGlow-${instanceId}`">
          <stop
            v-for="(stop, idx) in centerGlowStops"
            :key="idx"
            :offset="stop.offset"
            :stop-color="stop.color"
            :stop-opacity="stop.opacity"
          />
        </radialGradient>

        <!-- Linear gradient for rays -->
        <linearGradient
          :id="`rayGradient-${instanceId}`"
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
          :id="`animatedRayGradient-${instanceId}`"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            :stop-color="colors.rainbow.red"
            stop-opacity="0.9"
          >
            <animate
              attributeName="stop-color"
              :values="rainbowAnimationValues"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="40%"
            :stop-color="colors.rainbow.green"
            stop-opacity="0.7"
          >
            <animate
              attributeName="stop-color"
              :values="getShiftedRainbowValues(3)"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="100%"
            stop-color="transparent"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <!-- Center glow -->
      <circle
        cx="50"
        cy="50"
        r="15"
        :fill="`url(#centerGlow-${instanceId})`"
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
          :stroke="`url(#animatedRayGradient-${instanceId})`"
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
        :stroke="`url(#rayGradient-${instanceId})`"
        stroke-width="0.2"
        class="animate-ping-slow"
        style="opacity: 0.3"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        :stroke="`url(#rayGradient-${instanceId})`"
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
