<script setup lang="ts">
/**
 * EnergyThreads - Elegant flowing light energy along page margins
 *
 * Creates smooth, organic light beams that flow along the edges of the viewport.
 * Inspired by aurora borealis and energy currents - subtle, elegant, not confetti.
 *
 * LAZY LOADED: Renders after initial layout for better performance
 */

interface Props {
  side?: 'left' | 'right' | 'both'
  threads?: number
  intensity?: 'low' | 'medium' | 'high'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  side: 'both',
  threads: 3,
  intensity: 'medium',
  animated: true,
})

// Lazy load - render after layout
const isLoaded = ref(false)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  // Skip on mobile for performance
  if (isMobile.value) return

  // Delay rendering for faster initial paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isLoaded.value = true
    })
  })
})

const opacityMap = {
  low: 0.25,
  medium: 0.4,
  high: 0.55,
}

// Generate ultra-smooth flowing path using cubic bezier with many control points
const generateFlowingPath = (
  side: 'left' | 'right',
  index: number,
  total: number,
  timeOffset: number = 0
) => {
  const isLeft = side === 'left'

  // Position from edge - stay close to margins
  const edgeDistance = 3 + (index / Math.max(total - 1, 1)) * 6
  const xBase = isLeft ? edgeDistance : 100 - edgeDistance

  // Very gentle wave parameters for smooth, elegant flow
  const amplitude = 2 + index * 0.8
  const frequency = 0.8 + index * 0.15

  // Many segments for ultra-smooth curves
  const segments = 40
  const points: { x: number; y: number }[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * 100

    // Smooth sine wave with very gentle harmonics
    const phase = timeOffset * Math.PI * 2
    const wave = Math.sin(t * Math.PI * frequency * 2 + phase + index) * amplitude
    const gentleWobble = Math.sin(t * Math.PI * frequency * 3.5 + phase * 0.7) * (amplitude * 0.2)

    const xOffset = wave + gentleWobble
    const x = isLeft ? xBase + xOffset : xBase - xOffset

    points.push({ x: Math.max(0.5, Math.min(99.5, x)), y })
  }

  // Build ultra-smooth cubic bezier path
  if (points.length < 2) return ''

  let d = `M ${points[0]!.x.toFixed(3)} ${points[0]!.y.toFixed(3)}`

  // High tension Catmull-Rom for very smooth curves
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[Math.min(points.length - 1, i + 2)]!

    // Higher tension = smoother curves
    const tension = 0.5
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x.toFixed(3)} ${cp1y.toFixed(3)}, ${cp2x.toFixed(3)} ${cp2y.toFixed(3)}, ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`
  }

  return d
}

// Generate animation keyframes - smooth morphing between states
const generateMorphKeyframes = (side: 'left' | 'right', index: number, total: number) => {
  // 5 smooth phases for seamless looping
  return [0, 0.25, 0.5, 0.75, 1]
    .map((phase) => generateFlowingPath(side, index, total, phase))
    .join(';')
}

const leftPaths = computed(() => {
  if (props.side === 'right') return []
  return Array.from({ length: props.threads }, (_, i) => ({
    id: `left-${i}`,
    d: generateFlowingPath('left', i, props.threads, 0),
    morphFrames: generateMorphKeyframes('left', i, props.threads),
    duration: 12 + i * 4, // Slow, elegant movement
    width: 0.08 + i * 0.03, // Delicate lines
  }))
})

const rightPaths = computed(() => {
  if (props.side === 'left') return []
  return Array.from({ length: props.threads }, (_, i) => ({
    id: `right-${i}`,
    d: generateFlowingPath('right', i, props.threads, 0),
    morphFrames: generateMorphKeyframes('right', i, props.threads),
    duration: 14 + i * 4,
    width: 0.08 + i * 0.03,
  }))
})

const instanceId = Math.random().toString(36).substring(7)
</script>

<template>
  <!-- Lazy loaded, skipped on mobile -->
  <div
    v-if="isLoaded && !isMobile"
    class="pointer-events-none fixed inset-0 z-[1]"
    :style="{ opacity: opacityMap[intensity] }"
  >
    <svg
      class="h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <!-- Smooth rainbow gradient - pride spectrum -->
        <linearGradient
          :id="`energyGradient-${instanceId}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#ef4444"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#ef4444;#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6;#ef4444"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="20%"
            stop-color="#f97316"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6;#ef4444;#f97316"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="40%"
            stop-color="#eab308"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#eab308;#22c55e;#3b82f6;#8b5cf6;#ef4444;#f97316;#eab308"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="60%"
            stop-color="#22c55e"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#22c55e;#3b82f6;#8b5cf6;#ef4444;#f97316;#eab308;#22c55e"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="80%"
            stop-color="#3b82f6"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#3b82f6;#8b5cf6;#ef4444;#f97316;#eab308;#22c55e;#3b82f6"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop
            offset="100%"
            stop-color="#8b5cf6"
          >
            <animate
              v-if="animated"
              attributeName="stop-color"
              values="#8b5cf6;#ef4444;#f97316;#eab308;#22c55e;#3b82f6;#8b5cf6"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <!-- Soft glow filter for light effect -->
        <filter
          :id="`softGlow-${instanceId}`"
          x="-100%"
          y="-50%"
          width="300%"
          height="200%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.3"
            result="blur1"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.6"
            result="blur2"
          />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Outer aura for ethereal depth -->
        <filter
          :id="`aura-${instanceId}`"
          x="-200%"
          y="-100%"
          width="500%"
          height="300%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="1.2"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.4 0"
          />
        </filter>
      </defs>

      <!-- Left energy streams -->
      <g class="energy-left">
        <!-- Outer aura -->
        <path
          v-for="path in leftPaths"
          :key="`${path.id}-aura`"
          :d="path.d"
          fill="none"
          :stroke="`url(#energyGradient-${instanceId})`"
          :stroke-width="path.width * 5"
          stroke-linecap="round"
          :filter="`url(#aura-${instanceId})`"
          class="aura-line"
        >
          <animate
            v-if="animated"
            attributeName="d"
            :values="path.morphFrames"
            :dur="`${path.duration}s`"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
        <!-- Core light -->
        <path
          v-for="path in leftPaths"
          :key="path.id"
          :d="path.d"
          fill="none"
          :stroke="`url(#energyGradient-${instanceId})`"
          :stroke-width="path.width"
          stroke-linecap="round"
          :filter="`url(#softGlow-${instanceId})`"
          class="core-line"
        >
          <animate
            v-if="animated"
            attributeName="d"
            :values="path.morphFrames"
            :dur="`${path.duration}s`"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </g>

      <!-- Right energy streams -->
      <g class="energy-right">
        <!-- Outer aura -->
        <path
          v-for="path in rightPaths"
          :key="`${path.id}-aura`"
          :d="path.d"
          fill="none"
          :stroke="`url(#energyGradient-${instanceId})`"
          :stroke-width="path.width * 5"
          stroke-linecap="round"
          :filter="`url(#aura-${instanceId})`"
          class="aura-line"
        >
          <animate
            v-if="animated"
            attributeName="d"
            :values="path.morphFrames"
            :dur="`${path.duration}s`"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
        <!-- Core light -->
        <path
          v-for="path in rightPaths"
          :key="path.id"
          :d="path.d"
          fill="none"
          :stroke="`url(#energyGradient-${instanceId})`"
          :stroke-width="path.width"
          stroke-linecap="round"
          :filter="`url(#softGlow-${instanceId})`"
          class="core-line"
        >
          <animate
            v-if="animated"
            attributeName="d"
            :values="path.morphFrames"
            :dur="`${path.duration}s`"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.aura-line {
  opacity: 0.35;
  animation: breathe 8s ease-in-out infinite;
}

.core-line {
  opacity: 0.9;
  animation: pulse 6s ease-in-out infinite;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.45;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}
</style>
