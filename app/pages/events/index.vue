<script setup lang="ts">
/**
 * Events Listing Page
 *
 * Displays upcoming and past events with filtering and date grouping.
 * Uses async loading with skeleton states.
 */
useSeoMeta({
  title: 'Events',
  description:
    'Join guided events and experiences designed to synchronize your inner cycles with cosmic motion.',
})

// Types
interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'online' | 'in-person'
  isPast: boolean
}

// Filter state
const activeFilter = ref<'upcoming' | 'past'>('upcoming')

// Simulated async data (replace with real API)
const {
  data: allEvents,
  pending,
  error,
} = useLazyAsyncData<Event[]>(
  'events-list',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [
      {
        id: '1',
        title: 'Winter Solstice Sound Bath',
        description: 'A transformative sound healing experience to mark the longest night.',
        date: 'Dec 21, 2025',
        time: '7:00 PM',
        location: 'Mexico City',
        type: 'in-person',
        isPast: false,
      },
      {
        id: '2',
        title: 'Venus & Creativity Session',
        description: 'Explore how Venus transits enhance creativity and self-expression.',
        date: 'Jan 10, 2026',
        time: '6:00 PM CST',
        location: 'Online',
        type: 'online',
        isPast: false,
      },
      {
        id: '3',
        title: 'Full Moon Reflection Circle',
        description: 'A guided reflection practice under the light of the full moon.',
        date: 'Jan 25, 2026',
        time: '8:00 PM',
        location: 'Guadalajara',
        type: 'in-person',
        isPast: false,
      },
      {
        id: '4',
        title: 'New Year Intention Setting',
        description: 'Set powerful intentions aligned with the cosmic new year.',
        date: 'Mar 20, 2026',
        time: '10:00 AM CST',
        location: 'Online',
        type: 'online',
        isPast: false,
      },
      {
        id: '5',
        title: 'Autumn Equinox Gathering',
        description: 'Celebrated the balance of light and dark with community.',
        date: 'Sep 22, 2025',
        time: '6:00 PM',
        location: 'Mexico City',
        type: 'in-person',
        isPast: true,
      },
      {
        id: '6',
        title: 'Mercury Retrograde Workshop',
        description: 'Learned to navigate and thrive during retrograde seasons.',
        date: 'Aug 15, 2025',
        time: '5:00 PM CST',
        location: 'Online',
        type: 'online',
        isPast: true,
      },
    ]
  },
  { server: false }
)

// Filtered events based on active filter
const filteredEvents = computed(() => {
  if (!allEvents.value) return []
  return allEvents.value.filter((e) => (activeFilter.value === 'upcoming' ? !e.isPast : e.isPast))
})

// Count for tabs
const upcomingCount = computed(() => allEvents.value?.filter((e) => !e.isPast).length ?? 0)
const pastCount = computed(() => allEvents.value?.filter((e) => e.isPast).length ?? 0)
</script>

<template>
  <div>
    <!-- Hero -->
    <PageSection
      spacing="lg"
      centered
      decorations="hero"
    >
      <div class="mx-auto max-w-2xl">
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">Events</p>
        <h1 class="font-headers text-brand-base mb-4 text-4xl font-bold md:text-5xl">
          Gather under the stars
        </h1>
        <p class="text-brand-base/70 text-lg">
          Join guided events and experiences designed to synchronize your inner cycles with cosmic
          motion. From sound baths to reflection circles, each gathering is an invitation to expand.
        </p>
      </div>
    </PageSection>

    <!-- Filter Tabs -->
    <PageSection spacing="sm">
      <div class="border-brand-base/10 mb-8 flex gap-1 border-b">
        <button
          :class="[
            'relative px-4 py-2 text-sm font-medium transition',
            activeFilter === 'upcoming'
              ? 'text-brand-accent'
              : 'text-brand-base/50 hover:text-brand-base',
          ]"
          @click="activeFilter = 'upcoming'"
        >
          Upcoming
          <span
            v-if="upcomingCount > 0"
            class="bg-brand-accent/10 text-brand-accent ml-1.5 rounded-full px-2 py-0.5 text-xs"
          >
            {{ upcomingCount }}
          </span>
          <span
            v-if="activeFilter === 'upcoming'"
            class="bg-brand-accent absolute bottom-0 left-0 h-0.5 w-full"
          />
        </button>
        <button
          :class="[
            'relative px-4 py-2 text-sm font-medium transition',
            activeFilter === 'past'
              ? 'text-brand-accent'
              : 'text-brand-base/50 hover:text-brand-base',
          ]"
          @click="activeFilter = 'past'"
        >
          Past Events
          <span
            v-if="pastCount > 0"
            class="bg-brand-base/10 text-brand-base/60 ml-1.5 rounded-full px-2 py-0.5 text-xs"
          >
            {{ pastCount }}
          </span>
          <span
            v-if="activeFilter === 'past'"
            class="bg-brand-accent absolute bottom-0 left-0 h-0.5 w-full"
          />
        </button>
      </div>

      <!-- Events Grid -->
      <AsyncContent
        :loading="pending"
        :error="error"
        :empty="filteredEvents.length === 0"
      >
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="event in filteredEvents"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="group block"
          >
            <BaseCard
              hoverable
              padding="none"
              class="h-full overflow-hidden"
            >
              <!-- Event image placeholder -->
              <div class="bg-brand-base/5 relative aspect-[16/9]">
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-brand-base/20 text-4xl">✧</span>
                </div>
                <!-- Event type badge -->
                <span
                  :class="[
                    'absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium',
                    event.type === 'online'
                      ? 'bg-brand-secondary/20 text-brand-secondary'
                      : 'bg-brand-accent/20 text-brand-accent',
                  ]"
                >
                  {{ event.type === 'online' ? 'Online' : 'In-Person' }}
                </span>
              </div>

              <!-- Event details -->
              <div class="p-4">
                <p class="text-brand-accent mb-1 text-xs font-medium tracking-wide uppercase">
                  {{ event.date }} · {{ event.time }}
                </p>
                <h3
                  class="font-headers text-brand-base group-hover:text-brand-accent mb-2 text-lg font-semibold transition"
                >
                  {{ event.title }}
                </h3>
                <p class="text-brand-base/60 mb-3 line-clamp-2 text-sm">
                  {{ event.description }}
                </p>
                <p class="text-brand-base/40 flex items-center gap-1 text-xs">
                  <svg
                    class="h-3.5 w-3.5"
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
                  {{ event.location }}
                </p>
              </div>
            </BaseCard>
          </NuxtLink>
        </div>

        <!-- Loading skeletons -->
        <template #loading>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BaseCard
              v-for="i in 6"
              :key="i"
              padding="none"
              class="overflow-hidden"
            >
              <BaseSkeleton
                h="160px"
                w="100%"
              />
              <div class="space-y-3 p-4">
                <BaseSkeleton
                  h="0.75rem"
                  w="40%"
                />
                <BaseSkeleton
                  h="1.25rem"
                  w="80%"
                />
                <BaseSkeleton
                  h="0.875rem"
                  w="100%"
                />
                <BaseSkeleton
                  h="0.75rem"
                  w="30%"
                />
              </div>
            </BaseCard>
          </div>
        </template>

        <!-- Empty state -->
        <template #empty>
          <EmptyState
            :icon="activeFilter === 'upcoming' ? '📅' : '📜'"
            :title="activeFilter === 'upcoming' ? 'No upcoming events' : 'No past events'"
            :description="
              activeFilter === 'upcoming'
                ? 'New cosmic gatherings are being planned. Check back soon!'
                : 'Past events will appear here once we have some history.'
            "
          />
        </template>
      </AsyncContent>
    </PageSection>

    <!-- CTA -->
    <PageSection
      title="Want to host an event?"
      description="We collaborate with practitioners, spaces, and communities to bring cosmic experiences to life."
      width="sm"
      centered
    >
      <BaseButton to="/book">Get in touch</BaseButton>
    </PageSection>
  </div>
</template>
