<script setup lang="ts">
import { motion } from 'motion-v'

/**
 * BaseButton - Brand-aware button with motion animations
 *
 * All variants use brand color tokens from app/config/brand.ts.
 * Adapts automatically to light/dark mode.
 * Primary and contrast variants include glow shadows and motion effects.
 *
 * @example
 * ```vue
 * <BaseButton>Primary</BaseButton>
 * <BaseButton variant="secondary">Secondary</BaseButton>
 * <BaseButton variant="outline">Outline</BaseButton>
 * <BaseButton variant="ghost">Ghost</BaseButton>
 * <BaseButton variant="contrast">CTA</BaseButton>
 * <BaseButton variant="holographic">Special</BaseButton>
 * <BaseButton to="/about">Internal Link</BaseButton>
 * <BaseButton href="https://example.com">External Link</BaseButton>
 * ```
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'contrast'
  | 'holographic'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  to?: string // NuxtLink internal route
  href?: string // External link
  glow?: boolean // Enable glow shadow effect
  shimmer?: boolean // Enable shimmer sweep animation
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  to: undefined,
  href: undefined,
  glow: false,
  shimmer: false,
})

// Determine which element to render
const componentTag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

// Enable motion for all button variants
const useMotion = computed(() => !props.to && !props.href)

/**
 * Variant classes using brand color tokens
 * These reference CSS variables set by useBrand composable
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-white focus:ring-brand-accent/50',
  secondary: 'bg-brand-secondary text-white focus:ring-brand-secondary/50',
  contrast: 'bg-brand-neutral text-brand-base border border-transparent focus:ring-brand-accent/50',
  outline:
    'border-0 text-[var(--brand-earth-gradient-middle,#4a7c59)] focus:ring-[var(--brand-earth-gradient-middle,#4a7c59)]/50',
  ghost: 'text-brand-base hover:bg-brand-base/10 focus:ring-brand-base/50',
  holographic:
    'bg-brand-neutral text-brand-base border border-transparent focus:ring-brand-accent/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-2xl',
}

// Glow shadow classes for primary and contrast variants
const glowClasses = computed(() => {
  if (!props.glow && props.variant !== 'holographic') return ''
  switch (props.variant) {
    case 'primary':
    case 'holographic':
      return 'shadow-[0_0_20px_var(--color-brand-glow)]'
    case 'contrast':
      return 'shadow-[0_0_20px_rgba(249,168,37,0.3)]'
    default:
      return ''
  }
})

const buttonClasses = computed(() => [
  'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden',
  variantClasses[props.variant],
  sizeClasses[props.size],
  glowClasses.value,
  {
    'cursor-not-allowed opacity-50': props.disabled || props.loading,
    'btn-shimmer': props.shimmer && !props.disabled && !props.loading,
  },
])

// Motion animation config - ethereal hover with lift and glow
const hoverAnimation = computed(() => {
  const base = { scale: 1.05, y: -4, rotate: 0.5 }
  // Holographic gets extra dramatic movement
  if (props.variant === 'holographic') {
    return { ...base, scale: 1.06, y: -6 }
  }
  return base
})

const pressAnimation = { scale: 0.97, y: 0, rotate: 0 }
const transitionConfig = { type: 'spring' as const, stiffness: 300, damping: 20 }
</script>

<template>
  <!-- Contrast variant with animated rotating gradient border -->
  <motion.div
    v-if="variant === 'contrast'"
    class="btn-wrapper-contrast inline-block rounded-xl p-[2px]"
    :while-hover="!disabled && !loading ? { scale: 1.06, y: -6, rotate: 0.5 } : undefined"
    :while-tap="!disabled && !loading ? pressAnimation : undefined"
    :transition="transitionConfig"
  >
    <button
      v-if="!to && !href"
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
    <NuxtLink
      v-else-if="to"
      :to="to"
      :class="buttonClasses"
    >
      <slot />
    </NuxtLink>
    <a
      v-else
      :href="href"
      :class="buttonClasses"
      target="_blank"
      rel="noopener noreferrer"
    >
      <slot />
    </a>
  </motion.div>

  <!-- Outline variant with rotating gradient border -->
  <motion.div
    v-else-if="variant === 'outline'"
    class="btn-wrapper-outline inline-block rounded-xl p-[3px]"
    :while-hover="!disabled && !loading ? { scale: 1.05, y: -4, rotate: 0.5 } : undefined"
    :while-tap="!disabled && !loading ? pressAnimation : undefined"
    :transition="transitionConfig"
  >
    <button
      v-if="!to && !href"
      :class="[buttonClasses, 'bg-brand-neutral']"
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
    <NuxtLink
      v-else-if="to"
      :to="to"
      :class="[buttonClasses, 'bg-brand-neutral']"
    >
      <slot />
    </NuxtLink>
    <a
      v-else
      :href="href"
      :class="[buttonClasses, 'bg-brand-neutral']"
      target="_blank"
      rel="noopener noreferrer"
    >
      <slot />
    </a>
  </motion.div>

  <!-- Holographic variant with rotating gradient border wrapper (thicker) -->
  <motion.div
    v-else-if="variant === 'holographic'"
    class="btn-wrapper-holo inline-block rounded-xl p-[3px]"
    :while-hover="!disabled && !loading ? { scale: 1.06, y: -6, rotate: 0.5 } : undefined"
    :while-tap="!disabled && !loading ? pressAnimation : undefined"
    :transition="transitionConfig"
  >
    <button
      v-if="!to && !href"
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
    <NuxtLink
      v-else-if="to"
      :to="to"
      :class="buttonClasses"
    >
      <slot />
    </NuxtLink>
    <a
      v-else
      :href="href"
      :class="buttonClasses"
      target="_blank"
      rel="noopener noreferrer"
    >
      <slot />
    </a>
  </motion.div>

  <!-- Motion-enabled variants (primary, contrast, etc.) -->
  <motion.button
    v-else-if="useMotion"
    :class="[buttonClasses, 'btn-hover-glow']"
    :disabled="disabled || loading"
    :while-hover="!disabled && !loading ? hoverAnimation : undefined"
    :while-tap="!disabled && !loading ? pressAnimation : undefined"
    :transition="transitionConfig"
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
  </motion.button>

  <!-- Standard component for other variants and links -->
  <component
    :is="componentTag"
    v-else
    :class="buttonClasses"
    :disabled="componentTag === 'button' ? disabled || loading : undefined"
    :to="to"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
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
  </component>
</template>

<style scoped>
/* Shimmer sweep animation for CTA buttons */
.btn-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btn-shimmer-sweep 3s ease-in-out infinite;
}

@keyframes btn-shimmer-sweep {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}

/* Hover glow effect for motion buttons */
.btn-hover-glow {
  transition:
    box-shadow 0.3s ease,
    filter 0.3s ease;
}

.btn-hover-glow:hover:not(:disabled) {
  box-shadow:
    0 4px 20px var(--color-brand-glow),
    0 0 40px var(--color-brand-glow);
  filter: brightness(1.1);
}

/* Holographic wrapper with rotating gradient */
.btn-wrapper-holo {
  position: relative;
  background: transparent;
  isolation: isolate;
  transition:
    box-shadow 0.3s ease,
    filter 0.3s ease;
}

.btn-wrapper-holo::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(
    from var(--gradient-angle, 0deg),
    var(--color-brand-gradient-start),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-end),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-start)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-gradient 3s linear infinite;
  z-index: -1;
}

.btn-wrapper-holo:hover {
  box-shadow:
    0 8px 30px var(--color-brand-glow),
    0 0 60px var(--color-brand-glow),
    0 0 100px var(--color-brand-glow);
  filter: brightness(1.15) saturate(1.2);
}

.btn-wrapper-holo:hover::before {
  animation-duration: 1.5s;
}

/* Contrast variant with rotating gradient border */
.btn-wrapper-contrast {
  position: relative;
  background: transparent;
  isolation: isolate;
}

.btn-wrapper-contrast::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: conic-gradient(
    from var(--gradient-angle, 0deg),
    var(--color-brand-gradient-start),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-end),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-start)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-gradient 3s linear infinite;
  z-index: -1;
}

@keyframes rotate-gradient {
  0% {
    --gradient-angle: 0deg;
  }
  100% {
    --gradient-angle: 360deg;
  }
}

/* Register the custom property for animation */
@property --gradient-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.btn-wrapper-contrast:hover {
  box-shadow:
    0 8px 30px var(--color-brand-glow),
    0 0 60px var(--color-brand-glow);
  filter: brightness(1.1) saturate(1.15);
}

.btn-wrapper-contrast:hover::before {
  animation-duration: 1.5s;
}

/* Outline variant with rotating earth gradient border (browns/greens) */
.btn-wrapper-outline {
  position: relative;
  background: transparent;
  isolation: isolate;
  transition:
    box-shadow 0.3s ease,
    filter 0.3s ease;
}

.btn-wrapper-outline::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(
    from var(--gradient-angle, 0deg),
    var(--brand-earth-gradient-start, #8b5a2b),
    var(--brand-earth-gradient-middle, #4a7c59),
    var(--brand-earth-gradient-end, #c4a35a),
    var(--brand-earth-gradient-middle, #4a7c59),
    var(--brand-earth-gradient-start, #8b5a2b)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-gradient 3s linear infinite;
  z-index: -1;
}

.btn-wrapper-outline:hover {
  box-shadow:
    0 8px 30px rgba(74, 124, 89, 0.4),
    0 0 60px rgba(139, 90, 43, 0.3);
  filter: brightness(1.1) saturate(1.15);
}

.btn-wrapper-outline:hover::before {
  animation-duration: 1.5s;
}
</style>
