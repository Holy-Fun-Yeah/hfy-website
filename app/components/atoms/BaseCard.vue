<script setup lang="ts">
/**
 * BaseCard - Brand-aware card with glassmorphism and holographic variants
 *
 * A flexible container for elevated content with optional variants.
 * Uses brand color tokens for consistent theming.
 * Supports glassmorphism and holographic (rainbow border) effects.
 *
 * @example
 * ```vue
 * <BaseCard>Basic card content</BaseCard>
 * <BaseCard variant="glass">Frosted glass card</BaseCard>
 * <BaseCard variant="holographic">Rainbow border card</BaseCard>
 * <BaseCard variant="elevated" hoverable>Hover effect card</BaseCard>
 * <BaseCard animate>Scroll reveal animation</BaseCard>
 * ```
 */

export type CardVariant = 'default' | 'outline' | 'elevated' | 'glass' | 'holographic'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  variant?: CardVariant
  padding?: CardPadding
  hoverable?: boolean
  glow?: boolean
  float?: boolean // Enable ethereal floating effect on hover
  as?: 'div' | 'article' | 'section'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  glow: false,
  float: false,
  as: 'div',
})

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-brand-neutral border border-brand-base/10',
  outline: 'bg-transparent border-2 border-brand-base/20',
  elevated: 'bg-brand-neutral shadow-xl shadow-brand-base/10',
  glass: 'bg-brand-neutral/70 backdrop-blur-md border border-brand-base/10',
  holographic: 'bg-brand-neutral border border-transparent',
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

const hoverClasses = computed(() => {
  if (!props.hoverable && !props.float) return ''
  if (props.float) {
    // Ethereal floating effect with enhanced glow
    return 'hover:shadow-[0_8px_30px_var(--color-brand-glow),0_0_60px_var(--color-brand-glow)] hover:-translate-y-3 hover:rotate-[0.5deg] cursor-pointer'
  }
  return 'hover:shadow-lg hover:shadow-[var(--color-brand-glow)] hover:-translate-y-1 cursor-pointer'
})

const glowClasses = computed(() => {
  if (!props.glow) return ''
  return 'shadow-[0_0_25px_var(--color-brand-glow)] animate-pulse-glow'
})

const cardClasses = computed(() => [
  'rounded-2xl transition-all duration-500 ease-out',
  variantClasses[props.variant],
  paddingClasses[props.padding],
  hoverClasses.value,
  glowClasses.value,
])

// Check if holographic variant for wrapper rendering
const isHolographic = computed(() => props.variant === 'holographic')
</script>

<template>
  <!-- Holographic variant with gradient border wrapper -->
  <div
    v-if="isHolographic"
    class="rounded-2xl bg-gradient-to-br from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end p-[1px] transition-all duration-500 ease-out"
    :class="[
      float && 'hover:shadow-[0_8px_40px_var(--color-brand-glow),0_0_80px_var(--color-brand-glow)] hover:-translate-y-3 hover:rotate-[0.5deg] cursor-pointer',
      hoverable && !float && 'hover:shadow-[0_0_30px_var(--color-brand-glow)] hover:-translate-y-1 cursor-pointer',
      glow && 'shadow-[0_0_25px_var(--color-brand-glow)] animate-pulse-glow',
    ]"
  >
    <component
      :is="as"
      :class="cardClasses"
      class="h-full"
    >
      <slot />
    </component>
  </div>

  <!-- Standard variants -->
  <component
    v-else
    :is="as"
    :class="cardClasses"
  >
    <slot />
  </component>
</template>
