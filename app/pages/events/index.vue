<script setup lang="ts">
/**
 * Events Listing Page
 *
 * Displays upcoming and past events fetched from the API.
 * Uses async loading with skeleton states.
 */
const { t, currentLocale } = useLocale()

useSeoMeta({
  title: () => t('events.sectionLabel'),
  description: () => t('events.hero.subtitle'),
})

// Types (matching API response)
interface Event {
  id: string
  slug: string
  type: 'online' | 'in_person'
  startsAt: string
  endsAt: string
  host: string
  location: string
  bannerUrl: string | null
  usdPrice: string
  capacity: number | null
  title: string
  description: string
  lang: string
  isFallback: boolean
}

// API response type
interface ApiResponse {
  success: boolean
  data: Event[]
}

// Filter state
const activeFilter = ref<'upcoming' | 'past'>('upcoming')

// Fetch events from API based on filter
const {
  data: apiResponse,
  pending,
  error,
} = useLazyAsyncData<ApiResponse | null>(
  () => `events-${activeFilter.value}`,
  async () => {
    const result = await $fetch<ApiResponse>('/api/events', {
      query: { lang: currentLocale.value, filter: activeFilter.value, limit: 20 },
    })
    return result
  },
  { server: true, watch: [currentLocale, activeFilter] }
)

// Extract events from API response (handle error case)
const filteredEvents = computed<Event[]>(() => {
  if (!apiResponse.value || !('data' in apiResponse.value)) return []
  return apiResponse.value.data as Event[]
})

// Format date for display
function formatDateTime(dateString: string): { date: string; time: string } {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString(currentLocale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString(currentLocale.value, {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }
}

// We can't easily get counts for both filters from one API call,
// so we'll just show counts as the number of items in current view
const upcomingCount = computed(() =>
  activeFilter.value === 'upcoming' ? filteredEvents.value.length : 0
)
const pastCount = computed(() => (activeFilter.value === 'past' ? filteredEvents.value.length : 0))
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
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">
          {{ t('events.hero.eyebrow') }}
        </p>
        <h1 class="font-headers text-brand-base mb-4 text-4xl font-bold md:text-5xl">
          {{ t('events.hero.title') }}
        </h1>
        <p class="text-brand-base/70 text-lg">
          {{ t('events.hero.subtitle') }}
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
          {{ t('events.upcoming') }}
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
          {{ t('events.pastEvents') }}
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
                <img
                  v-if="event.bannerUrl"
                  :src="event.bannerUrl"
                  :alt="event.title"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="absolute inset-0 flex items-center justify-center"
                >
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
                  {{ event.type === 'online' ? t('events.online') : t('events.inPerson') }}
                </span>
              </div>

              <!-- Event details -->
              <div class="p-4">
                <p class="text-brand-accent mb-1 text-xs font-medium tracking-wide uppercase">
                  {{ formatDateTime(event.startsAt).date }} ·
                  {{ formatDateTime(event.startsAt).time }}
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
            :title="
              activeFilter === 'upcoming' ? t('events.noUpcoming.title') : t('events.noPast.title')
            "
            :description="
              activeFilter === 'upcoming'
                ? t('events.noUpcoming.description')
                : t('events.noPast.description')
            "
          />
        </template>
      </AsyncContent>
    </PageSection>

    <!-- CTA -->
    <PageSection
      :title="t('events.cta.title')"
      :description="t('events.cta.description')"
      width="sm"
      centered
    >
      <BaseButton to="/book">{{ t('events.cta.button') }}</BaseButton>
    </PageSection>
  </div>
</template>
