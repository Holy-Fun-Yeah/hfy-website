<script setup lang="ts">
/**
 * About Page
 *
 * Introduces AstraNova KaLeKa and the HFY philosophy.
 * Features Rainbow Diamond Light aesthetic with shimmer effects.
 */
useSeoMeta({
  title: 'About',
  description:
    'Discover AstraNova KaLeKa and the Rainbow Diamond Light philosophy. Transformative experiences guided by modern astrology and ancient intuition.',
})

const { brand } = useBrand()

const values = [
  {
    title: 'Authenticity',
    description: 'We honor both data and intuition, blending scientific understanding with sacred wisdom.',
    icon: '✦',
  },
  {
    title: 'Connection',
    description: 'Community over prediction. We create spaces for meaningful human connection and growth.',
    icon: '◇',
  },
  {
    title: 'Expansion',
    description: 'Learning through movement, art, and reflection. Every experience opens new pathways.',
    icon: '❋',
  },
]

const offerings = [
  {
    title: '1-to-1 Consultations',
    description: 'Personalized sessions diving deep into your birth chart, transits, and life questions.',
  },
  {
    title: 'Group Workshops',
    description: 'Themed gatherings aligned with lunar cycles, planetary transits, and seasonal shifts.',
  },
  {
    title: 'Digital Experiences',
    description: 'Online courses, meditations, and resources to support your ongoing cosmic journey.',
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageSection
      spacing="lg"
      centered
    >
      <div class="mx-auto max-w-3xl">
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">
          About AstraNova
        </p>
        <h1 class="font-headers text-brand-base mb-6 text-4xl font-bold md:text-5xl">
          Rainbow Diamond Light Overflow
        </h1>
        <p class="text-brand-base/70 text-xl leading-relaxed">
          {{ brand.name }} was born from the belief that astrology can be practical, poetic, and
          profoundly empowering — a cosmic mirror reflecting your infinite potential.
        </p>
      </div>
    </PageSection>

    <!-- About AstraNova KaLeKa -->
    <PageSection
      eyebrow="The Vision"
      title="A cosmic journey reimagined"
      divider
    >
      <div class="grid items-center gap-8 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-brand-base/70 leading-relaxed">
            AstraNova KaLeKa is a Divine Mexican Goddess with a Rainbow Diamond Heart, channeling
            Source Overflow intelligence through sacred technology and ancient wisdom.
          </p>
          <p class="text-brand-base/70 leading-relaxed">
            We're a collective of artists, technologists, and astrologers creating digital
            experiences that help people reconnect with the rhythm of the universe — blending modern
            aesthetics with spiritual depth.
          </p>
          <p class="text-brand-base/70 leading-relaxed">
            Every session, workshop, and digital experience is infused with Rainbow Diamond Light
            (RDL) Plasma Growth energy — designed to awaken your sovereign power and expand your
            consciousness.
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
                <p class="text-sm">Visual coming soon</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </PageSection>

    <!-- Core Values -->
    <PageSection
      eyebrow="Our Philosophy"
      title="Guiding principles"
      description="These values inform everything we create — from one-on-one sessions to large gatherings."
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
      eyebrow="Offerings"
      title="Ways to work together"
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
            "This website is a living, breathing reflection of Source Overflow intelligence —
            designed to express Rainbow Diamond Light through every interaction."
          </p>
          <footer class="text-brand-base/50 mt-6">
            — AstraNova KaLeKa
          </footer>
        </blockquote>
      </div>
    </PageSection>

    <!-- CTA -->
    <PageSection
      title="Ready to begin?"
      description="Book a consultation or explore upcoming events to start your cosmic journey."
      width="sm"
      centered
    >
      <div class="flex flex-wrap justify-center gap-3">
        <BaseButton to="/book">Book a session</BaseButton>
        <BaseButton
          variant="outline"
          to="/events"
        >
          View events
        </BaseButton>
      </div>
    </PageSection>
  </div>
</template>
