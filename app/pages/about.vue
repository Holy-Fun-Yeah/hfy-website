<script setup lang="ts">
/**
 * About Page
 *
 * Introduces AstraNova KaLeKa and the HFY philosophy.
 * Features Rainbow Diamond Light aesthetic with shimmer effects.
 */
const { t } = useLocale()

useSeoMeta({
  title: () => t('about.sectionLabel'),
  description: () => t('about.description'),
})

const { brand } = useBrand()

const values = computed(() => [
  {
    title: t('about.values.authenticity.title'),
    description: t('about.values.authenticity.description'),
    icon: '✦',
  },
  {
    title: t('about.values.connection.title'),
    description: t('about.values.connection.description'),
    icon: '◇',
  },
  {
    title: t('about.values.expansion.title'),
    description: t('about.values.expansion.description'),
    icon: '❋',
  },
])

const offerings = computed(() => [
  {
    title: t('about.offerings.consultations.title'),
    description: t('about.offerings.consultations.description'),
  },
  {
    title: t('about.offerings.workshops.title'),
    description: t('about.offerings.workshops.description'),
  },
  {
    title: t('about.offerings.digital.title'),
    description: t('about.offerings.digital.description'),
  },
])

// Vision paragraphs as array
const visionParagraphs = computed(() => {
  const paragraphs = t('about.vision.paragraphs')
  return Array.isArray(paragraphs) ? paragraphs : []
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageSection
      spacing="lg"
      centered
      decorations="hero"
    >
      <div class="mx-auto max-w-3xl">
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">
          {{ t('about.hero.eyebrow') }}
        </p>
        <h1 class="font-headers text-brand-base mb-6 text-4xl font-bold md:text-5xl">
          {{ t('about.hero.title') }}
        </h1>
        <p class="text-brand-base/70 text-xl leading-relaxed">
          {{ brand.name }} {{ t('about.hero.subtitle') }}
        </p>
      </div>
    </PageSection>

    <!-- About AstraNova KaLeKa -->
    <PageSection
      :eyebrow="t('about.vision.eyebrow')"
      :title="t('about.vision.title')"
      divider
    >
      <div class="grid items-center gap-8 md:grid-cols-2">
        <div class="space-y-4">
          <p
            v-for="(paragraph, index) in visionParagraphs"
            :key="index"
            class="text-brand-base/70 leading-relaxed"
          >
            {{ paragraph }}
          </p>
        </div>
        <div class="relative">
          <!-- Decorative glow effect -->
          <div
            class="bg-brand-accent/20 absolute -inset-4 rounded-3xl blur-3xl"
            aria-hidden="true"
          />
          <BaseCard
            variant="elevated"
            padding="lg"
            class="relative"
          >
            <div class="text-brand-base/30 grid aspect-[4/3] place-items-center text-center">
              <div>
                <div class="mb-2 text-5xl">✧</div>
                <p class="text-sm">{{ t('about.vision.imagePlaceholder') }}</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </PageSection>

    <!-- Core Values -->
    <PageSection
      :eyebrow="t('about.values.eyebrow')"
      :title="t('about.values.title')"
      :description="t('about.values.description')"
      centered
      divider
    >
      <div class="grid gap-6 md:grid-cols-3">
        <BaseCard
          v-for="value in values"
          :key="value.title"
          padding="lg"
          class="text-center"
        >
          <div class="text-brand-accent mb-3 text-3xl">{{ value.icon }}</div>
          <h3 class="font-headers text-brand-base mb-2 text-xl font-semibold">
            {{ value.title }}
          </h3>
          <p class="text-brand-base/60">
            {{ value.description }}
          </p>
        </BaseCard>
      </div>
    </PageSection>

    <!-- What We Offer -->
    <PageSection
      :eyebrow="t('about.offerings.eyebrow')"
      :title="t('about.offerings.title')"
      divider
    >
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="offering in offerings"
          :key="offering.title"
          class="border-brand-accent/30 border-l-2 pl-4"
        >
          <h3 class="font-headers text-brand-base mb-2 font-semibold">
            {{ offering.title }}
          </h3>
          <p class="text-brand-base/60 text-sm">
            {{ offering.description }}
          </p>
        </div>
      </div>
    </PageSection>

    <!-- Mission Statement with shimmer effect -->
    <PageSection
      spacing="lg"
      centered
    >
      <div class="relative mx-auto max-w-2xl">
        <!-- Subtle shimmer background -->
        <div
          class="from-brand-accent/5 via-brand-secondary/5 to-brand-contrast/5 absolute -inset-8 rounded-3xl bg-gradient-to-br"
          aria-hidden="true"
        />
        <blockquote class="relative text-center">
          <p class="font-headers text-brand-base text-2xl leading-relaxed italic md:text-3xl">
            "{{ t('about.quote.text') }}"
          </p>
          <footer class="text-brand-base/50 mt-6">— {{ t('about.quote.author') }}</footer>
        </blockquote>
      </div>
    </PageSection>

    <!-- CTA -->
    <PageSection
      :title="t('about.cta.title')"
      :description="t('about.cta.description')"
      width="sm"
      centered
    >
      <div class="flex flex-wrap justify-center gap-3">
        <BaseButton to="/book">{{ t('about.cta.bookButton') }}</BaseButton>
        <BaseButton
          variant="outline"
          to="/events"
        >
          {{ t('about.cta.eventsButton') }}
        </BaseButton>
      </div>
    </PageSection>
  </div>
</template>
