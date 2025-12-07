<script setup lang="ts">
definePageMeta({
  title: 'Home',
})

const { brand } = useBrand()
const { data: health } = await useFetch('/api/health')

// Display tagline as array for flexibility
const taglines = computed(() =>
  Array.isArray(brand.value.tagline) ? brand.value.tagline : [brand.value.tagline]
)
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <section class="flex flex-col items-center gap-6 py-8 text-center">
      <h1 class="font-logo text-brand-accent text-5xl font-bold tracking-tight">
        {{ brand.name }}
      </h1>

      <p
        v-for="(tagline, idx) in taglines"
        :key="idx"
        class="font-headers text-brand-base/80 text-xl"
      >
        {{ tagline }}
      </p>

      <p class="text-brand-base/60 mx-auto max-w-2xl text-lg">
        A production-ready template with Tailwind CSS v4, Drizzle ORM, Zod validation, and the brand
        system for easy theming.
      </p>

      <div class="mt-4 flex gap-4">
        <NuxtLink to="/about">
          <BaseButton size="lg">Learn More</BaseButton>
        </NuxtLink>
        <a
          href="https://nuxt.com/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BaseButton
            variant="outline"
            size="lg"
          >
            Documentation
          </BaseButton>
        </a>
      </div>
    </section>

    <!-- Feature Cards -->
    <section class="mt-16 grid gap-8 md:grid-cols-3">
      <FeatureCard
        title="Tailwind CSS v4"
        description="Modern utility-first CSS with brand-aware color system and prose styles."
        icon="palette"
        color="accent"
      />
      <FeatureCard
        title="Drizzle ORM"
        description="Type-safe database queries with PostgreSQL and automatic migrations."
        icon="database"
        color="secondary"
      />
      <FeatureCard
        title="Zod Validation"
        description="Runtime type validation for API endpoints and form data."
        icon="shield"
        color="contrast"
      />
    </section>

    <!-- Button Variants Showcase -->
    <section class="mt-16">
      <h2 class="font-headers text-brand-base text-2xl font-bold">Button Variants</h2>
      <p class="text-brand-base/60 mt-2">All buttons use brand colors from BrandConfig</p>

      <div class="mt-6 flex flex-wrap gap-4">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="contrast">Contrast</BaseButton>
        <BaseButton variant="outline">Outline</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton
          variant="primary"
          disabled
        >
          Disabled
        </BaseButton>
        <BaseButton
          variant="primary"
          loading
        >
          Loading
        </BaseButton>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-4">
        <BaseButton
          variant="primary"
          size="sm"
        >
          Small
        </BaseButton>
        <BaseButton
          variant="primary"
          size="md"
        >
          Medium
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
        >
          Large
        </BaseButton>
      </div>
    </section>

    <!-- API Health Check -->
    <section class="bg-brand-neutral mt-16 rounded-xl p-6 shadow-sm">
      <h2 class="font-headers text-brand-base text-xl font-bold">API Health Check</h2>
      <pre
        class="bg-brand-base text-brand-neutral font-secondary mt-4 overflow-auto rounded-lg p-4 text-sm"
        >{{ JSON.stringify(health, null, 2) }}</pre
      >
    </section>
  </div>
</template>
