<script setup lang="ts">
/**
 * Event Detail Page
 *
 * Displays full event information with registration CTA.
 * Uses async loading with skeleton state via tRPC.
 */
const route = useRoute()
const router = useRouter()
const eventSlug = route.params.slug as string
const { t, currentLocale } = useLocale()
const { $trpc } = useNuxtApp()
const { isLoggedIn } = useAuth()

// Registration modal state
const showRegistrationModal = ref(false)
const registrationSuccess = ref(false)

// Fetch event via tRPC (use slug)
const {
  data: event,
  pending,
  error,
} = useLazyAsyncData(
  `event-${eventSlug}-${currentLocale.value}`,
  () => $trpc.events.bySlug.query({ slug: eventSlug, lang: currentLocale.value }),
  { server: true, watch: [currentLocale] }
)

// Check if event is past
const isPast = computed(() => {
  if (!event.value) return false
  return new Date(event.value.startsAt) < new Date()
})

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(currentLocale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time for display
function formatTime(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  return `${start.toLocaleTimeString(currentLocale.value, options)} - ${end.toLocaleTimeString(currentLocale.value, options)}`
}

// Calculate duration with translations
function calculateDuration(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes} ${t('events.detail.minutes')}`
  if (minutes === 0)
    return `${hours} ${hours > 1 ? t('events.detail.hours') : t('events.detail.hour')}`
  return `${hours}h ${minutes}m`
}

// Format price with translations
function formatPrice(usdPrice: string | null): string {
  if (!usdPrice || usdPrice === '0' || usdPrice === '0.00') return t('events.detail.free')
  return `$${parseFloat(usdPrice).toFixed(0)} USD`
}

// Dynamic SEO
useSeoMeta({
  title: () => event.value?.title ?? 'Event',
  description: () => event.value?.description ?? 'Event details',
})

// Check registration status (only when logged in and event loaded)
const { data: registrationStatus, refresh: refreshRegistration } = useLazyAsyncData(
  `registration-${eventSlug}`,
  async () => {
    if (!isLoggedIn.value || !event.value) return null
    return await $trpc.registrations.checkRegistration.query({ eventId: event.value.id })
  },
  {
    watch: [isLoggedIn, event],
    server: false,
  }
)

const isRegistered = computed(() => registrationStatus.value?.isRegistered ?? false)

// Check if redirected after login (has registered=pending query param)
onMounted(() => {
  if (route.query.register === 'true' && isLoggedIn.value && event.value && !isPast.value) {
    // User was redirected here after login, open modal
    showRegistrationModal.value = true
    // Clear the query param
    router.replace({ query: {} })
  }
})

// Handle Register Now click
function handleRegisterClick() {
  if (!isLoggedIn.value) {
    // Redirect to login with return URL
    const returnUrl = `/events/${eventSlug}?register=true`
    router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
    return
  }

  showRegistrationModal.value = true
}

// Handle registration success
function handleRegistrationSuccess(_registrationId: string) {
  showRegistrationModal.value = false
  registrationSuccess.value = true
  refreshRegistration()
}
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
          :title="t('common.error')"
          description="We couldn't load this event. Please try again."
        >
          <BaseButton to="/events">{{ t('nav.events') }}</BaseButton>
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
          :title="t('events.noUpcoming.title')"
          :description="t('events.noUpcoming.description')"
        >
          <BaseButton to="/events">{{ t('events.viewAll') }}</BaseButton>
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
              {{ t('nav.events') }}
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
          <!-- Fallback language notice -->
          <p
            v-if="event.isFallback"
            class="bg-brand-accent/10 text-brand-accent mb-4 inline-block rounded-full px-3 py-1 text-xs"
          >
            {{ t('events.detail.showingInEnglish') }}
          </p>

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
                {{
                  event.type === 'online'
                    ? t('events.detail.onlineEvent')
                    : t('events.detail.inPersonEvent')
                }}
              </span>

              <h1 class="font-headers text-brand-base mb-4 text-3xl font-bold md:text-4xl">
                {{ event.title }}
              </h1>

              <p class="text-brand-base/70 mb-6 text-lg">
                {{ event.description }}
              </p>

              <!-- Banner Image -->
              <div
                v-if="event.bannerUrl"
                class="mb-8 overflow-hidden rounded-lg"
              >
                <img
                  :src="event.bannerUrl"
                  :alt="event.title"
                  class="h-auto w-full object-cover"
                />
              </div>

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
                    <p class="text-brand-base font-medium">{{ formatDate(event.startsAt) }}</p>
                    <p class="text-brand-base/50 text-sm">
                      {{ formatTime(event.startsAt, event.endsAt) }}
                    </p>
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
                    <a
                      v-if="event.googleMapsUrl"
                      :href="event.googleMapsUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-brand-accent text-sm hover:underline"
                    >
                      {{ t('events.detail.viewOnGoogleMaps') }} →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Detail content (markdown) -->
              <div
                v-if="event.detail"
                class="mb-8"
              >
                <BaseMarkdown
                  :content="event.detail"
                  size="lg"
                />
              </div>
            </div>

            <!-- Sidebar: Registration Card -->
            <div class="lg:sticky lg:top-20">
              <BaseCard
                variant="elevated"
                padding="lg"
              >
                <div class="mb-4">
                  <p class="text-brand-base/50 text-sm">{{ t('events.detail.price') }}</p>
                  <p class="font-headers text-brand-base text-2xl font-bold">
                    {{ formatPrice(event.usdPrice) }}
                  </p>
                </div>

                <div class="border-brand-base/10 mb-4 space-y-3 border-t pt-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-brand-base/50">{{ t('events.detail.duration') }}</span>
                    <span class="text-brand-base">{{
                      calculateDuration(event.startsAt, event.endsAt)
                    }}</span>
                  </div>
                  <div
                    v-if="event.capacity"
                    class="flex justify-between text-sm"
                  >
                    <span class="text-brand-base/50">{{ t('events.detail.capacity') }}</span>
                    <span class="text-brand-base"
                      >{{ event.capacity }} {{ t('events.detail.spaces') }}</span
                    >
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-brand-base/50">{{ t('events.detail.host') }}</span>
                    <span class="text-brand-base">{{ event.host }}</span>
                  </div>
                </div>

                <!-- Registration Success Message -->
                <div
                  v-if="registrationSuccess || isRegistered"
                  class="bg-brand-accent/10 border-brand-accent/30 flex items-center gap-3 rounded-lg border p-3"
                >
                  <div class="text-brand-accent text-xl">✓</div>
                  <div class="flex-1">
                    <p class="text-brand-base text-sm font-medium">
                      {{ t('events.detail.registered') }}
                    </p>
                    <p class="text-brand-muted text-xs">
                      {{ t('events.detail.seeYouThere') }}
                    </p>
                  </div>
                </div>

                <!-- Register Button -->
                <BaseButton
                  v-else-if="!isPast"
                  class="w-full"
                  size="lg"
                  @click="handleRegisterClick"
                >
                  {{ t('events.detail.registerNow') }}
                </BaseButton>

                <!-- Event Ended -->
                <p
                  v-else
                  class="text-brand-base/50 text-center text-sm"
                >
                  {{ t('events.detail.eventEnded') }}
                </p>

                <p class="text-brand-base/40 mt-4 text-center text-xs">
                  {{ t('events.detail.questions') }}
                  <NuxtLink
                    to="/book"
                    class="text-brand-accent hover:underline"
                  >
                    {{ t('events.detail.contactUs') }}
                  </NuxtLink>
                </p>
              </BaseCard>
            </div>
          </div>
        </div>
      </PageSection>

      <!-- More Events CTA -->
      <PageSection
        :title="t('events.detail.exploreMore')"
        centered
        width="sm"
      >
        <BaseButton
          variant="outline"
          to="/events"
        >
          {{ t('events.detail.viewAllEvents') }}
        </BaseButton>
      </PageSection>

      <!-- Registration Modal -->
      <RegistrationModal
        v-if="event"
        :event="{
          id: event.id,
          title: event.title,
          startsAt:
            event.startsAt instanceof Date ? event.startsAt.toISOString() : String(event.startsAt),
          usdPrice: event.usdPrice,
        }"
        :open="showRegistrationModal"
        @close="showRegistrationModal = false"
        @success="handleRegistrationSuccess"
      />
    </template>
  </div>
</template>
