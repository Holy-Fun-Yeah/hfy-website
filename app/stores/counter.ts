export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  function setCount(value: number) {
    count.value = value
  }

  return {
    // State
    count,
    // Getters
    doubleCount,
    isPositive,
    // Actions
    increment,
    decrement,
    reset,
    setCount,
  }
})
