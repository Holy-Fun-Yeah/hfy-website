<script setup lang="ts">
/**
 * ScrollGradientOverlay - Scroll-reactive gradient background
 *
 * Applies a subtle, animated gradient overlay that shifts colors
 * as the user scrolls through the page.
 *
 * @example
 * ```vue
 * <ScrollGradientOverlay />
 * <ScrollGradientOverlay :intensity="0.15" position="top" />
 * ```
 */

interface Props {
  intensity?: number // 0-1 opacity
  position?: 'full' | 'top' | 'bottom' | 'edges'
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 0.08,
  position: 'edges',
})

const { gradientStyle, currentColors } = useScrollGradient()

// Different gradient masks based on position
const maskStyle = computed(() => {
  switch (props.position) {
    case 'top':
      return 'linear-gradient(to bottom, black 0%, transparent 100%)'
    case 'bottom':
      return 'linear-gradient(to top, black 0%, transparent 100%)'
    case 'edges':
      return 'linear-gradient(to right, black 0%, transparent 20%, transparent 80%, black 100%)'
    case 'full':
    default:
      return 'none'
  }
})

// Dynamic gradient based on scroll position
const overlayGradient = computed(() => {
  return `linear-gradient(135deg,
    ${currentColors.value.start}40,
    ${currentColors.value.middle}20,
    ${currentColors.value.end}40
  )`
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-1000"
    :style="{
      ...gradientStyle,
      opacity: intensity,
      background: overlayGradient,
      maskImage: maskStyle,
      WebkitMaskImage: maskStyle,
    }"
  />
</template>
