<template>
  <label
    class="flex w-full max-w-sm min-h-[44px] items-center gap-3 rounded-full border border-dusk/15 bg-white/80 px-4 py-2 shadow-sm"
    :for="inputId"
  >
    <span class="text-xs uppercase tracking-[0.35em] text-dusk/50">Search</span>
    <input
      :id="inputId"
      class="w-full min-h-[2rem] bg-transparent text-sm outline-none placeholder:text-dusk/50"
      type="search"
      autocomplete="off"
      :value="modelValue"
      placeholder="Search by title or tag"
      aria-label="Search resources by title or tag"
      @input="handleInput"
    />
  </label>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const inputId = useId()

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // TODO: Implementing search filtering logic requires considering performance.
  emit('update:modelValue', target.value)
}
</script>
