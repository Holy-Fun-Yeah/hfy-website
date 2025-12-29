<script setup lang="ts">
/**
 * Pronouns Select Component
 *
 * Dropdown selector for inclusive gender/pronouns options.
 * Supports multilingual labels via useLocale.
 *
 * @example
 * <PronounsSelect v-model="pronouns" />
 */

const { t } = useLocale()

interface Props {
  modelValue?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Pronouns options with translation keys
const pronounsOptions = [
  { value: 'she/her', labelKey: 'pronouns.sheHer' },
  { value: 'he/him', labelKey: 'pronouns.heHim' },
  { value: 'they/them', labelKey: 'pronouns.theyThem' },
  { value: 'she/they', labelKey: 'pronouns.sheThey' },
  { value: 'he/they', labelKey: 'pronouns.heThey' },
  { value: 'any', labelKey: 'pronouns.any' },
  { value: 'prefer_not_to_say', labelKey: 'pronouns.preferNotToSay' },
] as const

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
  return pronounsOptions.find((opt) => opt.value === props.modelValue)
})

const displayLabel = computed(() => {
  if (!selectedOption.value) {
    return t('pronouns.selectPronouns')
  }
  return t(selectedOption.value.labelKey)
})

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="pronouns-select relative"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      class="bg-brand-neutral border-brand-base/20 text-brand-base focus:border-brand-accent focus:ring-brand-accent/20 flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="{ 'border-brand-accent ring-brand-accent/20 ring-2': isOpen }"
      @click="toggleDropdown"
    >
      <span :class="{ 'text-brand-muted': !selectedOption }">
        {{ displayLabel }}
      </span>
      <svg
        class="text-brand-muted h-5 w-5 transition-transform"
        :class="{ 'rotate-180': isOpen }"
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

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="bg-brand-neutral border-brand-base/20 absolute z-50 mt-1 w-full rounded-lg border shadow-lg"
      >
        <ul class="max-h-60 overflow-auto py-1">
          <li
            v-for="option in pronounsOptions"
            :key="option.value"
          >
            <button
              type="button"
              class="text-brand-base hover:bg-brand-accent/10 flex w-full items-center px-4 py-2 text-left transition"
              :class="{
                'bg-brand-accent/10 font-medium': option.value === modelValue,
              }"
              @click="selectOption(option.value)"
            >
              {{ t(option.labelKey) }}
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
