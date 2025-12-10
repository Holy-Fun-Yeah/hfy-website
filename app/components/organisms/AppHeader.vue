<script setup lang="ts">
/**
 * AppHeader - Frosted glass navigation with holographic accents
 *
 * Features:
 * - Glassmorphism navbar with enhanced blur
 * - Gradient underline for active nav links
 * - Motion-animated mobile menu with AnimatePresence
 * - Theme toggle with smooth icon transitions
 * - Scroll-aware transparency
 * - Language switcher with flags
 */

import { AnimatePresence, Motion } from 'motion-v'

const { brand } = useBrand()
const { isDark, toggleTheme } = useTheme()
const fontSizeStore = useFontSizeStore()
const { currentLocaleInfo, availableLocales, switchLocale, t } = useLocale()
const { isLoggedIn, isAdmin, signOut } = useAuth()

const mobileMenuOpen = ref(false)
const langMenuOpen = ref(false)
const userMenuOpen = ref(false)

// Close menus when clicking outside
function closeMenus() {
  langMenuOpen.value = false
  userMenuOpen.value = false
}

// Handle locale selection (switch locale and close menu)
function selectLocale(code: string) {
  switchLocale(code as 'en' | 'es' | 'de' | 'fr')
  langMenuOpen.value = false
}

// Handle sign out from user menu dropdown
function handleUserMenuSignOut() {
  signOut()
  userMenuOpen.value = false
}

// Handle sign out from mobile menu
function handleMobileSignOut() {
  signOut()
  mobileMenuOpen.value = false
}

// Scroll-aware header transparency
const isScrolled = ref(false)

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('click', closeMenus)
  handleScroll() // Check initial state

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('click', closeMenus)
  })
})

// Navigation links with translation keys
const navLinks = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/about', label: t('nav.about') },
  { to: '/blog', label: t('nav.blog') },
  { to: '/events', label: t('nav.events') },
  { to: '/book', label: t('nav.book') },
])

// Motion configs for mobile menu
const menuAnimation = { opacity: 1, height: 'auto', y: 0 }
const menuInitial = { opacity: 0, height: 0, y: -10 }
const menuExit = { opacity: 0, height: 0, y: -10 }
const menuTransition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

// Stagger animation for menu items
const getItemDelay = (index: number) => ({
  opacity: 1,
  x: 0,
  transition: { delay: 0.05 * index, duration: 0.2 },
})
const itemInitial = { opacity: 0, x: -10 }
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 backdrop-blur-lg transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-brand-background/50 shadow-brand-base/5 shadow-sm'
        : 'bg-brand-background/80',
    ]"
  >
    <!-- Content fade gradient - fades content as it scrolls under header -->
    <div
      class="from-brand-background pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b to-transparent transition-opacity duration-300"
      :class="isScrolled ? 'opacity-100' : 'opacity-0'"
    />

    <nav class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
      <!-- Logo with gradient hover -->
      <NuxtLink
        to="/"
        class="font-logo text-xl font-bold transition-all duration-300 hover:drop-shadow-[0_0_8px_var(--color-brand-glow)]"
      >
        <span
          class="from-brand-gradient-start via-brand-gradient-middle to-brand-gradient-end bg-gradient-to-r bg-clip-text text-transparent"
        >
          {{ brand.name }}
        </span>
      </NuxtLink>

      <!-- Desktop Nav with gradient active indicator -->
      <ul class="font-primary hidden items-center gap-6 md:flex">
        <li
          v-for="link in navLinks"
          :key="link.to"
          class="relative"
        >
          <NuxtLink
            :to="link.to"
            class="nav-link text-brand-muted hover:text-brand-accent py-1 transition-colors duration-200"
            active-class="nav-link-active text-brand-accent font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <!-- Theme Toggle with glow effect -->
        <button
          type="button"
          class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg p-2 transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg
            v-if="!isDark"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <!-- Font Size Toggle -->
        <button
          type="button"
          class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
          :title="`Font size: ${fontSizeStore.label} (click to cycle)`"
          @click="fontSizeStore.cycleSize()"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          <span class="hidden sm:inline">{{ fontSizeStore.size.toUpperCase() }}</span>
        </button>

        <!-- Language Switcher -->
        <div class="relative">
          <button
            type="button"
            class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
            title="Change language"
            @click.stop="langMenuOpen = !langMenuOpen"
          >
            <span class="text-sm">{{ currentLocaleInfo.flag }}</span>
            <span class="hidden sm:inline">{{ currentLocaleInfo.code.toUpperCase() }}</span>
            <svg
              class="h-3 w-3 transition-transform duration-200"
              :class="{ 'rotate-180': langMenuOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Language Dropdown -->
          <AnimatePresence>
            <Motion
              v-if="langMenuOpen"
              as="div"
              :initial="{ opacity: 0, y: -8, scale: 0.95 }"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: -8, scale: 0.95 }"
              :transition="{ duration: 0.15 }"
              class="bg-brand-background/95 border-brand-base/10 absolute top-full right-0 mt-1 min-w-[140px] overflow-hidden rounded-lg border shadow-lg backdrop-blur-lg"
              @click.stop
            >
              <ul class="py-1">
                <li
                  v-for="locale in availableLocales"
                  :key="locale.code"
                >
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                    :class="[
                      locale.code === currentLocaleInfo.code
                        ? 'bg-brand-accent/10 text-brand-accent'
                        : 'text-brand-muted hover:bg-brand-accent/5 hover:text-brand-accent',
                    ]"
                    @click="selectLocale(locale.code)"
                  >
                    <span class="text-base">{{ locale.flag }}</span>
                    <span class="font-medium">{{ locale.code.toUpperCase() }}</span>
                    <span class="text-brand-muted/70 text-xs">{{ locale.name }}</span>
                  </button>
                </li>
              </ul>
            </Motion>
          </AnimatePresence>
        </div>

        <!-- User Menu / Login Button -->
        <div class="relative hidden sm:block">
          <!-- Login Button (not logged in) -->
          <NuxtLink
            v-if="!isLoggedIn"
            to="/login"
            class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
          >
            {{ t('userMenu.logIn') }}
          </NuxtLink>

          <!-- User Icon with Dropdown (logged in) -->
          <button
            v-else
            type="button"
            class="hover:bg-brand-accent/10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 hover:shadow-[0_0_12px_var(--color-brand-glow)]"
            :class="
              isAdmin
                ? 'border-brand-accent text-brand-accent'
                : 'border-brand-muted text-brand-muted hover:border-brand-accent hover:text-brand-accent'
            "
            :title="t('userMenu.account')"
            @click.stop="userMenuOpen = !userMenuOpen"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          <AnimatePresence>
            <Motion
              v-if="userMenuOpen && isLoggedIn"
              as="div"
              :initial="{ opacity: 0, y: -8, scale: 0.95 }"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: -8, scale: 0.95 }"
              :transition="{ duration: 0.15 }"
              class="bg-brand-background/95 border-brand-base/10 absolute top-full right-0 mt-1 min-w-[160px] overflow-hidden rounded-lg border shadow-lg backdrop-blur-lg"
              @click.stop
            >
              <ul class="py-1">
                <!-- Account -->
                <li>
                  <NuxtLink
                    to="/account"
                    class="text-brand-muted hover:bg-brand-accent/5 hover:text-brand-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                    @click="userMenuOpen = false"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {{ t('userMenu.account') }}
                  </NuxtLink>
                </li>

                <!-- Admin: Editor -->
                <li v-if="isAdmin">
                  <NuxtLink
                    to="/admin/editor"
                    class="text-brand-accent hover:bg-brand-accent/5 flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors"
                    @click="userMenuOpen = false"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {{ t('userMenu.editor') }}
                  </NuxtLink>
                </li>

                <!-- Non-Admin: Courses & Content -->
                <template v-else>
                  <li>
                    <NuxtLink
                      to="/courses"
                      class="text-brand-muted hover:bg-brand-accent/5 hover:text-brand-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                      @click="userMenuOpen = false"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      {{ t('userMenu.courses') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink
                      to="/content"
                      class="text-brand-muted hover:bg-brand-accent/5 hover:text-brand-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                      @click="userMenuOpen = false"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      {{ t('userMenu.content') }}
                    </NuxtLink>
                  </li>
                </template>

                <!-- Divider -->
                <li class="border-brand-base/10 my-1 border-t" />

                <!-- Sign Out -->
                <li>
                  <button
                    type="button"
                    class="text-brand-muted hover:bg-brand-accent/5 hover:text-brand-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                    @click="handleUserMenuSignOut"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {{ t('auth.signOut') }}
                  </button>
                </li>
              </ul>
            </Motion>
          </AnimatePresence>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="text-brand-muted hover:text-brand-accent p-2 transition-colors md:hidden"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            class="h-6 w-6 transition-transform duration-200"
            :class="{ 'rotate-90': mobileMenuOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!mobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu with AnimatePresence -->
    <AnimatePresence>
      <Motion
        v-if="mobileMenuOpen"
        as="div"
        :initial="menuInitial"
        :animate="menuAnimation"
        :exit="menuExit"
        :transition="menuTransition"
        class="border-brand-base/10 bg-brand-background/90 overflow-hidden border-t backdrop-blur-lg md:hidden"
      >
        <ul class="font-primary space-y-1 px-4 py-3">
          <Motion
            v-for="(link, index) in navLinks"
            :key="link.to"
            as="li"
            :initial="itemInitial"
            :animate="getItemDelay(index)"
          >
            <NuxtLink
              :to="link.to"
              class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 block rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
              active-class="text-brand-accent bg-brand-accent/10 font-medium"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </Motion>

          <!-- Mobile User Menu -->
          <Motion
            as="li"
            :initial="itemInitial"
            :animate="getItemDelay(navLinks.length)"
            class="border-brand-base/10 mt-2 border-t pt-2"
          >
            <!-- Login Button (not logged in) -->
            <NuxtLink
              v-if="!isLoggedIn"
              to="/login"
              class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
              @click="mobileMenuOpen = false"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {{ t('userMenu.logIn') }}
            </NuxtLink>

            <!-- User Menu (logged in) -->
            <template v-else>
              <!-- Account -->
              <NuxtLink
                to="/account"
                class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
                @click="mobileMenuOpen = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ t('userMenu.account') }}
              </NuxtLink>

              <!-- Admin: Editor -->
              <NuxtLink
                v-if="isAdmin"
                to="/admin/editor"
                class="text-brand-accent hover:bg-brand-accent/5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-lg font-medium transition-all duration-200"
                @click="mobileMenuOpen = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {{ t('userMenu.editor') }}
              </NuxtLink>

              <!-- Non-Admin: Courses & Content -->
              <template v-else>
                <NuxtLink
                  to="/courses"
                  class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
                  @click="mobileMenuOpen = false"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {{ t('userMenu.courses') }}
                </NuxtLink>
                <NuxtLink
                  to="/content"
                  class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-lg transition-all duration-200"
                  @click="mobileMenuOpen = false"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  {{ t('userMenu.content') }}
                </NuxtLink>
              </template>

              <!-- Sign Out -->
              <button
                type="button"
                class="text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-lg transition-all duration-200"
                @click="handleMobileSignOut"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {{ t('auth.signOut') }}
              </button>
            </template>
          </Motion>
        </ul>
      </Motion>
    </AnimatePresence>
  </header>
</template>

<style scoped>
/* Gradient underline for active nav links */
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    to right,
    var(--color-brand-gradient-start),
    var(--color-brand-gradient-middle),
    var(--color-brand-gradient-end)
  );
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-link:hover::after,
.nav-link-active::after {
  transform: scaleX(1);
}

.nav-link-active::after {
  box-shadow: 0 0 8px var(--color-brand-glow);
}
</style>
