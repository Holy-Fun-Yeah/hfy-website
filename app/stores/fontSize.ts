/**
 * Font Size Store
 *
 * Manages user font size preference across the site.
 * Persists to localStorage for cross-session retention.
 */

export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

export const useFontSizeStore = defineStore('fontSize', () => {
  const size = ref<FontSize>('md')

  // Font size scale factors - larger differences for accessibility
  const scales: Record<FontSize, number> = {
    sm: 0.85, // 13.6px base - compact view
    md: 1, // 16px base (default)
    lg: 1.25, // 20px base - easier reading
    xl: 1.5, // 24px base - large text for low vision
  }

  const labels: Record<FontSize, string> = {
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    xl: 'Extra Large',
  }

  const scale = computed(() => scales[size.value])
  const label = computed(() => labels[size.value])

  function setSize(newSize: FontSize) {
    size.value = newSize
    applySize()
    saveToStorage()
  }

  function cycleSize() {
    const sizes: FontSize[] = ['sm', 'md', 'lg', 'xl']
    const currentIndex = sizes.indexOf(size.value)
    const nextIndex = (currentIndex + 1) % sizes.length
    setSize(sizes[nextIndex]!)
  }

  function applySize() {
    if (import.meta.client) {
      document.documentElement.style.fontSize = `${scales[size.value] * 100}%`
    }
  }

  function saveToStorage() {
    if (import.meta.client) {
      localStorage.setItem('hfy-font-size', size.value)
    }
  }

  function loadFromStorage() {
    if (import.meta.client) {
      const stored = localStorage.getItem('hfy-font-size') as FontSize | null
      if (stored && ['sm', 'md', 'lg', 'xl'].includes(stored)) {
        size.value = stored
        applySize()
      }
    }
  }

  // Initialize on client
  if (import.meta.client) {
    loadFromStorage()
  }

  return {
    size,
    scale,
    label,
    setSize,
    cycleSize,
    loadFromStorage,
  }
})
