<script setup lang="ts">
/**
 * HeroSection - Ethereal hero with parallax and magical entrance
 *
 * Features:
 * - Staggered text reveal with blur-to-focus effect
 * - Floating decorative orbs
 * - Parallax scrolling elements
 * - Pulsing CTA glow
 *
 * @example
 * ```vue
 * <HeroSection
 *   eyebrow="Welcome to"
 *   title="Your Cosmic Journey"
 *   description="Discover the magic within"
 *   cta-text="Begin"
 *   cta-link="/start"
 * />
 * ```
 */

import { Motion } from 'motion-v'

interface Props {
  eyebrow?: string
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
}

withDefaults(defineProps<Props>(), {
  eyebrow: undefined,
  description: undefined,
  ctaText: undefined,
  ctaLink: undefined,
  secondaryCtaText: undefined,
  secondaryCtaLink: undefined,
})

// Staggered entrance animations
const containerAnimation = { opacity: 1 }
const containerInitial = { opacity: 0 }

const eyebrowAnimation = { opacity: 1, y: 0, filter: 'blur(0px)' }
const eyebrowInitial = { opacity: 0, y: 20, filter: 'blur(8px)' }

const titleAnimation = { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
const titleInitial = { opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.95 }

const descAnimation = { opacity: 1, y: 0 }
const descInitial = { opacity: 0, y: 20 }

const ctaAnimation = { opacity: 1, y: 0, scale: 1 }
const ctaInitial = { opacity: 0, y: 20, scale: 0.9 }

// Easing for ethereal feel
const etherealEase = [0.22, 1, 0.36, 1] as [number, number, number, number]
</script>

<template>
  <section class="relative overflow-hidden py-20 md:py-32">
    <!-- Decorative floating orbs -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="animate-float-slow from-brand-gradient-start/20 absolute top-[20%] left-[10%] h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl"
      />
      <div
        class="animate-float animate-delay-200 from-brand-gradient-middle/20 absolute top-[30%] right-[15%] h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-2xl"
      />
      <div
        class="animate-float-fast animate-delay-400 from-brand-gradient-end/20 absolute bottom-[20%] left-[20%] h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl"
      />
    </div>

    <Motion
      as="div"
      :initial="containerInitial"
      :animate="containerAnimation"
      :transition="{ duration: 0.3 }"
      class="relative z-10 mx-auto max-w-4xl px-4 text-center"
    >
      <!-- Eyebrow with shimmer -->
      <Motion
        v-if="eyebrow"
        as="div"
        :initial="eyebrowInitial"
        :animate="eyebrowAnimation"
        :transition="{ duration: 0.6, ease: etherealEase, delay: 0.1 }"
        class="mb-4"
      >
        <span
          class="border-brand-accent/30 bg-brand-accent/10 text-brand-accent inline-block rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide"
        >
          {{ eyebrow }}
        </span>
      </Motion>

      <!-- Title with dramatic entrance -->
      <Motion
        as="h1"
        :initial="titleInitial"
        :animate="titleAnimation"
        :transition="{ duration: 0.8, ease: etherealEase, delay: 0.2 }"
        class="font-headers mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl"
      >
        <span
          class="from-brand-base via-brand-accent to-brand-secondary bg-gradient-to-r bg-clip-text text-transparent"
        >
          {{ title }}
        </span>
      </Motion>

      <!-- Description -->
      <Motion
        v-if="description"
        as="p"
        :initial="descInitial"
        :animate="descAnimation"
        :transition="{ duration: 0.6, ease: etherealEase, delay: 0.4 }"
        class="text-brand-muted mx-auto mb-8 max-w-2xl text-lg md:text-xl"
      >
        {{ description }}
      </Motion>

      <!-- CTAs with glow -->
      <Motion
        v-if="ctaText || secondaryCtaText"
        as="div"
        :initial="ctaInitial"
        :animate="ctaAnimation"
        :transition="{ duration: 0.5, ease: etherealEase, delay: 0.6 }"
        class="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <BaseButton
          v-if="ctaText"
          :to="ctaLink"
          variant="holographic"
          size="lg"
          class="animate-pulse-glow"
        >
          {{ ctaText }}
        </BaseButton>

        <BaseButton
          v-if="secondaryCtaText"
          :to="secondaryCtaLink"
          variant="ghost"
          size="lg"
        >
          {{ secondaryCtaText }}
        </BaseButton>
      </Motion>

      <!-- Decorative elements -->
      <div class="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2">
        <Motion
          as="div"
          :initial="{ opacity: 0, scale: 0 }"
          :animate="{ opacity: 0.5, scale: 1 }"
          :transition="{ duration: 1, ease: etherealEase, delay: 0.8 }"
          class="via-brand-accent h-px w-40 bg-gradient-to-r from-transparent to-transparent"
        />
      </div>
    </Motion>

    <!-- Scroll indicator -->
    <Motion
      as="div"
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 1.2 }"
      class="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <div class="animate-float text-brand-muted/50 flex flex-col items-center gap-2">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </Motion>
  </section>
</template>
