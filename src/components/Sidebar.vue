<template>
  <nav aria-labelledby="categories-heading">
    <h2 id="categories-heading" class="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-dusk/50">
      Categories
    </h2>
    <ul class="space-y-2" role="list">
      <li v-for="category in categories" :key="category">
        <button
          type="button"
          class="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition"
          :class="
            category === activeCategory
              ? 'bg-ink text-sand'
              : 'bg-sand/70 text-ink hover:bg-clay/60'
          "
          :aria-current="category === activeCategory ? 'true' : undefined"
          @click="emit('select', category)"
        >
          <span>{{ category }}</span>
          <span class="text-xs opacity-70" aria-hidden="true">›</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[]
  activeCategory: string
}>()

const emit = defineEmits<{
  (event: 'select', category: string): void
}>()
</script>
