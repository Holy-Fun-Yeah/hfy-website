<script setup lang="ts">
/**
 * SacredGeometry - Rotating mandala and flower of life overlays
 *
 * Subtle geometric patterns that float at corners/edges.
 * Adds mystical depth without overwhelming content.
 *
 * @example
 * ```vue
 * <SacredGeometry pattern="flowerOfLife" position="top-right" />
 * <SacredGeometry pattern="mandala" position="bottom-left" :rotate="true" />
 * ```
 */

interface Props {
  pattern?: 'flowerOfLife' | 'mandala' | 'metatron' | 'spiral'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  size?: number // px
  opacity?: number
  rotate?: boolean
  color?: 'gradient' | 'brand' | 'gold'
}

const props = withDefaults(defineProps<Props>(), {
  pattern: 'flowerOfLife',
  position: 'top-right',
  size: 300,
  opacity: 0.08,
  rotate: true,
  color: 'gradient',
})

const positionClasses = {
  'top-left': '-top-20 -left-20',
  'top-right': '-top-20 -right-20',
  'bottom-left': '-bottom-20 -left-20',
  'bottom-right': '-bottom-20 -right-20',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
}

// Generate flower of life circles
const flowerCircles = computed(() => {
  const circles = []
  const centerX = 50
  const centerY = 50
  const radius = 12

  // Center circle
  circles.push({ cx: centerX, cy: centerY, r: radius })

  // 6 surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180
    circles.push({
      cx: centerX + radius * Math.cos(angle),
      cy: centerY + radius * Math.sin(angle),
      r: radius,
    })
  }

  // Outer ring of 12 circles
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180
    circles.push({
      cx: centerX + radius * 2 * Math.cos(angle),
      cy: centerY + radius * 2 * Math.sin(angle),
      r: radius,
    })
  }

  return circles
})

// Generate mandala paths
const mandalaRings = computed(() => {
  const rings: { cx: number; cy: number; r: number; ring: number }[] = []
  const petalsPerRing = [8, 12, 16, 24]

  petalsPerRing.forEach((petals, ringIndex) => {
    const ringRadius = 10 + ringIndex * 10
    for (let i = 0; i < petals; i++) {
      const angle = (i * (360 / petals) * Math.PI) / 180
      rings.push({
        cx: 50 + ringRadius * Math.cos(angle),
        cy: 50 + ringRadius * Math.sin(angle),
        r: 3 - ringIndex * 0.5,
        ring: ringIndex,
      })
    }
  })

  return rings
})

// Spiral points
const spiralPoints = computed(() => {
  const points = []
  const turns = 3
  const pointsPerTurn = 30

  for (let i = 0; i < turns * pointsPerTurn; i++) {
    const angle = (i / pointsPerTurn) * 2 * Math.PI
    const radius = 5 + i * 0.5
    points.push({
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    })
  }

  return points
})

const spiralPath = computed(() => {
  const pts = spiralPoints.value
  if (pts.length === 0) return ''
  const first = pts[0]
  if (!first) return ''
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < pts.length; i++) {
    const pt = pts[i]!
    d += ` L ${pt.x} ${pt.y}`
  }
  return d
})
</script>

<template>
  <div
    class="pointer-events-none absolute"
    :class="[positionClasses[position], { 'animate-spin-very-slow': rotate }]"
    :style="{ width: `${size}px`, height: `${size}px`, opacity }"
  >
    <svg
      viewBox="0 0 100 100"
      class="h-full w-full"
    >
      <defs>
        <linearGradient
          id="sacredGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stop-color="var(--color-brand-gradient-start)" />
          <stop offset="50%" stop-color="var(--color-brand-gradient-middle)" />
          <stop offset="100%" stop-color="var(--color-brand-gradient-end)" />
        </linearGradient>

        <linearGradient id="goldGradient">
          <stop offset="0%" stop-color="#ffd700" />
          <stop offset="100%" stop-color="#ff8c00" />
        </linearGradient>
      </defs>

      <!-- Flower of Life -->
      <g v-if="pattern === 'flowerOfLife'">
        <circle
          v-for="(circle, idx) in flowerCircles"
          :key="idx"
          :cx="circle.cx"
          :cy="circle.cy"
          :r="circle.r"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.3"
        />
      </g>

      <!-- Mandala -->
      <g v-if="pattern === 'mandala'">
        <!-- Outer rings -->
        <circle
          v-for="r in 4"
          :key="`ring-${r}`"
          cx="50"
          cy="50"
          :r="r * 10"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.2"
        />
        <!-- Petals -->
        <circle
          v-for="(petal, idx) in mandalaRings"
          :key="`petal-${idx}`"
          :cx="petal.cx"
          :cy="petal.cy"
          :r="petal.r"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.2"
        />
      </g>

      <!-- Metatron's Cube (simplified) -->
      <g v-if="pattern === 'metatron'">
        <!-- Central hexagon -->
        <polygon
          points="50,30 67,40 67,60 50,70 33,60 33,40"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.3"
        />
        <!-- Connecting lines -->
        <line
          v-for="i in 6"
          :key="`meta-${i}`"
          x1="50"
          y1="50"
          :x2="50 + 25 * Math.cos(((i * 60 - 90) * Math.PI) / 180)"
          :y2="50 + 25 * Math.sin(((i * 60 - 90) * Math.PI) / 180)"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.2"
        />
        <!-- Outer circles -->
        <circle
          v-for="i in 6"
          :key="`meta-circle-${i}`"
          :cx="50 + 20 * Math.cos(((i * 60 - 90) * Math.PI) / 180)"
          :cy="50 + 20 * Math.sin(((i * 60 - 90) * Math.PI) / 180)"
          r="8"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.2"
        />
      </g>

      <!-- Spiral -->
      <g v-if="pattern === 'spiral'">
        <path
          :d="spiralPath"
          fill="none"
          :stroke="color === 'gold' ? 'url(#goldGradient)' : 'url(#sacredGradient)'"
          stroke-width="0.4"
          stroke-linecap="round"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.animate-spin-very-slow {
  animation: spin 120s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
