declare module 'vue-tel-input' {
  import { DefineComponent } from 'vue'

  export const VueTelInput: DefineComponent<{
    modelValue?: string
    mode?: 'auto' | 'international' | 'national'
    defaultCountry?: string
    inputOptions?: {
      placeholder?: string
      id?: string
      styleClasses?: string
    }
    dropdownOptions?: {
      showDialCodeInSelection?: boolean
      showFlags?: boolean
      showSearchBox?: boolean
    }
  }>
}
