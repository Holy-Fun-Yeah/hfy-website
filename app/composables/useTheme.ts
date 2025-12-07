import type { ThemeMode } from '~/types/brand'

const STORAGE_KEY = 'theme-mode'

/**
 * Theme management composable
 *
 * Manages light/dark mode with localStorage persistence.
 * Auto-imported in Nuxt - no import needed.
 *
 * @example
 * ```vue
 * <script setup>
 * const { isDark, toggleTheme } = useTheme()
 * </script>
 *
 * <template>
 *   <button @click="toggleTheme">
 *     {{ isDark ? 'Light' : 'Dark' }} Mode
 *   </button>
 * </template>
 * ```
 */
export function useTheme() {
  // Use useState for SSR-safe state that persists across navigation
  const themeMode = useState<ThemeMode>('theme-mode', () => 'light')

  // Only access localStorage on client
  if (import.meta.client) {
    // Initialize from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      themeMode.value = stored
    }
  }

  /** Whether dark mode is currently active */
  const isDark = computed(() => themeMode.value === 'dark')

  /** Set theme mode */
  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
  }

  /** Toggle between light and dark */
  function toggleTheme() {
    setTheme(themeMode.value === 'dark' ? 'light' : 'dark')
  }

  // Watch for changes and update localStorage + document class
  watch(
    themeMode,
    (mode) => {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, mode)

        // Update document class for Tailwind dark mode (if needed)
        if (mode === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    { immediate: true }
  )

  return {
    /** Current theme mode (light/dark) */
    themeMode: computed(() => themeMode.value),
    /** Whether dark mode is active */
    isDark,
    /** Set theme mode */
    setTheme,
    /** Toggle between light and dark */
    toggleTheme,
  }
}
