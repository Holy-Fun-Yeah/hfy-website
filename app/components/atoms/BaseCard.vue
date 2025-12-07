<script setup lang="ts">
/**
 * BaseCard - Brand-aware card component
 *
 * A flexible container for elevated content with optional variants.
 * Uses brand color tokens for consistent theming.
 *
 * @example
 * ```vue
 * <BaseCard>Basic card content</BaseCard>
 * <BaseCard variant="outline">Outlined card</BaseCard>
 * <BaseCard variant="elevated" padding="lg">Large padded card</BaseCard>
 * <BaseCard hoverable>Hover effect card</BaseCard>
 * ```
 */

export type CardVariant = 'default' | 'outline' | 'elevated'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  variant?: CardVariant
  padding?: CardPadding
  hoverable?: boolean
  as?: 'div' | 'article' | 'section'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  as: 'div',
})

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-brand-neutral border border-brand-base/10',
  outline: 'bg-transparent border-2 border-brand-base/20',
  elevated: 'bg-brand-neutral shadow-lg shadow-brand-base/5',
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const cardClasses = computed(() => [
  'rounded-xl transition-all',
  variantClasses[props.variant],
  paddingClasses[props.padding],
  {
    'hover:shadow-md hover:shadow-brand-accent/10 hover:-translate-y-0.5 cursor-pointer':
      props.hoverable,
  },
])
</script>

<template>
  <component
    :is="as"
    :class="cardClasses"
  >
    <slot />
  </component>
</template>
