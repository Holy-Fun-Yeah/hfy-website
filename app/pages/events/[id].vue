<script setup lang="ts">
/**
 * Event Detail Page
 *
 * Displays full event information with registration CTA.
 * Uses async loading with skeleton state.
 */
const route = useRoute()
const eventId = route.params.id as string

// Types
interface EventDetail {
  id: string
  title: string
  description: string
  longDescription: string
  date: string
  time: string
  duration: string
  location: string
  address?: string
  type: 'online' | 'in-person'
  price: string
  capacity: string
  host: string
  isPast: boolean
  includes: string[]
}

// Simulated async data (replace with real API)
const {
  data: event,
  pending,
  error,
} = useLazyAsyncData<EventDetail | null>(
  `event-${eventId}`,
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock event data
    const events: Record<string, EventDetail> = {
      '1': {
        id: '1',
        title: 'Winter Solstice Sound Bath',
        description: 'A transformative sound healing experience to mark the longest night.',
        longDescription: `Join us for a profound evening of sonic immersion as we honor the Winter Solstice — the longest night of the year and a powerful portal for inner transformation.

This ceremonial sound bath weaves together crystal singing bowls, chimes, drums, and voice to guide you into deep states of relaxation and receptivity. As the external world enters its darkest moment, we turn inward to plant seeds of intention for the returning light.

The experience includes:
- Opening ceremony and intention setting
- 75-minute immersive sound journey
- Guided visualization for the Solstice portal
- Closing integration and group sharing
- Warm herbal tea and light refreshments`,
        date: 'December 21, 2025',
        time: '7:00 PM - 9:30 PM',
        duration: '2.5 hours',
        location: 'Mexico City',
        address: 'Casa Corazón, Roma Norte',
        type: 'in-person',
        price: '$850 MXN',
        capacity: '25 spaces',
        host: 'AstraNova KaLeKa',
        isPast: false,
        includes: [
          'Sound healing session',
          'Guided meditation',
          'Intention-setting ceremony',
          'Herbal tea & refreshments',
          'Take-home Solstice ritual guide',
        ],
      },
      '2': {
        id: '2',
        title: 'Venus & Creativity Session',
        description: 'Explore how Venus transits enhance creativity and self-expression.',
        longDescription: `Venus, the planet of beauty, pleasure, and creative flow, offers us a cosmic invitation to reconnect with our artistic essence.

In this online workshop, we'll explore:
- How Venus influences your natal chart and current transits
- Practical exercises to activate Venusian creativity
- Guided journaling prompts for self-expression
- A collective art-making meditation
- Ways to honor Venus in your daily life

This is perfect for artists, creatives, or anyone seeking to invite more beauty and pleasure into their life. No artistic experience required — only an open heart.`,
        date: 'January 10, 2026',
        time: '6:00 PM - 8:00 PM CST',
        duration: '2 hours',
        location: 'Online via Zoom',
        type: 'online',
        price: '$45 USD',
        capacity: '50 spaces',
        host: 'AstraNova KaLeKa',
        isPast: false,
        includes: [
          'Live Zoom session',
          'Recording access for 30 days',
          'PDF workbook',
          'Personalized Venus insights',
          'Private community access',
        ],
      },
    }

    return events[eventId] || null
  },
  { server: false }
)

// Dynamic SEO
useSeoMeta({
  title: () => event.value?.title ?? 'Event',
  description: () => event.value?.description ?? 'Event details',
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <template v-if="pending">
      <PageSection spacing="lg">
        <div class="mx-auto max-w-3xl">
          <BaseSkeleton
            h="1rem"
            w="20%"
            class="mb-4"
          />
          <BaseSkeleton
            h="2.5rem"
            w="80%"
            class="mb-4"
          />
          <BaseSkeleton
            h="1.25rem"
            w="60%"
            class="mb-8"
          />
          <div class="grid gap-4 md:grid-cols-2">
            <BaseSkeleton h="200px" />
            <div class="space-y-3">
              <BaseSkeleton h="1rem" />
              <BaseSkeleton h="1rem" />
              <BaseSkeleton h="1rem" />
              <BaseSkeleton h="3rem" />
            </div>
          </div>
        </div>
      </PageSection>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <PageSection
        spacing="lg"
        centered
      >
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          description="We couldn't load this event. Please try again."
        >
          <BaseButton to="/events">Back to Events</BaseButton>
        </EmptyState>
      </PageSection>
    </template>

    <!-- Not Found State -->
    <template v-else-if="!event">
      <PageSection
        spacing="lg"
        centered
      >
        <EmptyState
          icon="🔍"
          title="Event not found"
          description="This event may have been removed or the link is incorrect."
        >
          <BaseButton to="/events">Browse Events</BaseButton>
        </EmptyState>
      </PageSection>
    </template>

    <!-- Event Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <div class="bg-brand-neutral/50 border-brand-base/10 border-b">
        <div class="mx-auto max-w-5xl px-4 py-3">
          <nav class="text-sm">
            <NuxtLink
              to="/events"
              class="text-brand-base/50 hover:text-brand-accent transition"
            >
              Events
            </NuxtLink>
            <span class="text-brand-base/30 mx-2">/</span>
            <span class="text-brand-base/70">{{ event.title }}</span>
          </nav>
        </div>
      </div>

      <!-- Hero -->
      <PageSection
        spacing="lg"
        decorations="subtle"
      >
        <div class="mx-auto max-w-5xl">
          <div class="grid items-start gap-8 lg:grid-cols-3">
            <!-- Main Content -->
            <div class="lg:col-span-2">
              <!-- Type badge -->
              <span
                :class="[
                  'mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium',
                  event.type === 'online'
                    ? 'bg-brand-secondary/20 text-brand-secondary'
                    : 'bg-brand-accent/20 text-brand-accent',
                ]"
              >
                {{ event.type === 'online' ? 'Online Event' : 'In-Person Event' }}
              </span>

              <h1 class="font-headers text-brand-base mb-4 text-3xl font-bold md:text-4xl">
                {{ event.title }}
              </h1>

              <p class="text-brand-base/70 mb-6 text-lg">
                {{ event.description }}
              </p>

              <!-- Event meta -->
              <div class="border-brand-base/10 mb-8 grid gap-4 border-y py-6 sm:grid-cols-2">
                <div class="flex items-start gap-3">
                  <div class="bg-brand-accent/10 rounded-lg p-2">
                    <svg
                      class="text-brand-accent h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-brand-base font-medium">{{ event.date }}</p>
                    <p class="text-brand-base/50 text-sm">{{ event.time }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-brand-accent/10 rounded-lg p-2">
                    <svg
                      class="text-brand-accent h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-brand-base font-medium">{{ event.location }}</p>
                    <p
                      v-if="event.address"
                      class="text-brand-base/50 text-sm"
                    >
                      {{ event.address }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Long description -->
              <div class="prose prose-lg text-brand-base/80 mb-8 max-w-none whitespace-pre-line">
                {{ event.longDescription }}
              </div>

              <!-- What's included -->
              <div class="mb-8">
                <h2 class="font-headers text-brand-base mb-4 text-xl font-semibold">
                  What's Included
                </h2>
                <ul class="space-y-2">
                  <li
                    v-for="item in event.includes"
                    :key="item"
                    class="text-brand-base/70 flex items-center gap-2"
                  >
                    <svg
                      class="text-brand-accent h-5 w-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Sidebar: Registration Card -->
            <div class="lg:sticky lg:top-20">
              <BaseCard
                variant="elevated"
                padding="lg"
              >
                <div class="mb-4">
                  <p class="text-brand-base/50 text-sm">Price</p>
                  <p class="font-headers text-brand-base text-2xl font-bold">
                    {{ event.price }}
                  </p>
                </div>

                <div class="border-brand-base/10 mb-4 space-y-3 border-t pt-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-brand-base/50">Duration</span>
                    <span class="text-brand-base">{{ event.duration }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-brand-base/50">Capacity</span>
                    <span class="text-brand-base">{{ event.capacity }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-brand-base/50">Host</span>
                    <span class="text-brand-base">{{ event.host }}</span>
                  </div>
                </div>

                <BaseButton
                  v-if="!event.isPast"
                  class="w-full"
                  size="lg"
                >
                  Register Now
                </BaseButton>
                <p
                  v-else
                  class="text-brand-base/50 text-center text-sm"
                >
                  This event has ended
                </p>

                <p class="text-brand-base/40 mt-4 text-center text-xs">
                  Questions?
                  <NuxtLink
                    to="/book"
                    class="text-brand-accent hover:underline"
                    >Contact us</NuxtLink
                  >
                </p>
              </BaseCard>
            </div>
          </div>
        </div>
      </PageSection>

      <!-- More Events CTA -->
      <PageSection
        title="Explore more events"
        centered
        width="sm"
      >
        <BaseButton
          variant="outline"
          to="/events"
        >
          View all events
        </BaseButton>
      </PageSection>
    </template>
  </div>
</template>
