<script setup lang="ts">
/**
 * BaseButton - Brand-aware button component
 *
 * All variants use brand color tokens from app/config/brand.ts.
 * Adapts automatically to light/dark mode.
 *
 * @example
 * ```vue
 * <BaseButton>Primary</BaseButton>
 * <BaseButton variant="secondary">Secondary</BaseButton>
 * <BaseButton variant="outline">Outline</BaseButton>
 * <BaseButton variant="ghost">Ghost</BaseButton>
 * <BaseButton variant="contrast">CTA</BaseButton>
 * ```
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'contrast'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

/**
 * Variant classes using brand color tokens
 * These reference CSS variables set by useBrand composable
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-brand-neutral hover:brightness-110 focus:ring-brand-accent',
  secondary:
    'bg-brand-secondary text-brand-neutral hover:brightness-110 focus:ring-brand-secondary',
  contrast: 'bg-brand-contrast text-brand-base hover:brightness-110 focus:ring-brand-contrast',
  outline:
    'border-2 border-brand-accent text-brand-accent hover:bg-brand-accent/10 focus:ring-brand-accent',
  ghost: 'text-brand-base hover:bg-brand-base/10 focus:ring-brand-base',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const buttonClasses = computed(() => [
  'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
  variantClasses[props.variant],
  sizeClasses[props.size],
  {
    'cursor-not-allowed opacity-50': props.disabled || props.loading,
  },
])
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="mr-2 -ml-1 h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>
