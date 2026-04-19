<template>
  <div class="min-h-screen px-4 py-6 sm:px-6 md:px-10 md:py-8">
    <a
      href="#main-content"
      class="fixed left-4 top-0 z-[100] -translate-y-[130%] rounded-b-lg bg-ink px-4 py-3 text-sm font-medium text-sand shadow-lg transition-transform focus:z-[101] focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-sand"
      @click.prevent="skipToMain"
    >
      Skip to main content
    </a>

    <header class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
      <div class="min-w-0">
        <h1 class="text-3xl font-semibold text-ink md:text-4xl">Personal Resource Hub</h1>
        <p class="mt-2 max-w-2xl text-sm text-dusk/80">
          A curated dashboard for articles, tools, and references. Keep it intentionally small,
          fast, and actionable.
        </p>
      </div>
      <div class="w-full shrink-0 md:w-auto md:max-w-sm">
        <SearchBar v-model="query" />
      </div>
    </header>

    <div
      class="relative grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)]"
    >
      <aside class="min-w-0 rounded-2xl bg-white/70 p-4 shadow-card" aria-label="Category filters">
        <Sidebar
          :categories="categories"
          :active-category="activeCategory"
          @select="handleCategorySelect"
        />
      </aside>

      <main
        id="main-content"
        ref="mainRef"
        class="min-w-0 rounded-2xl bg-white/80 p-4 shadow-card sm:p-6"
        tabindex="-1"
      >
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h2 id="resource-shelf-heading" class="text-xl font-semibold">Resource Shelf</h2>
            <p id="resource-count" class="text-sm text-dusk/70">{{ filteredResources.length }} items</p>
          </div>
          <p class="shrink-0 text-xs uppercase tracking-[0.25em] text-dusk/50 sm:text-right">
            <span class="sr-only">Active category: </span>{{ activeCategory }}
          </p>
        </div>

        <div v-if="filteredResources.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ResourceCard v-for="item in filteredResources" :key="item.id" :item="item" />
        </div>
        <div
          v-else
          role="status"
          aria-live="polite"
          class="flex flex-col items-center justify-center rounded-2xl border border-dusk/10 bg-white/70 px-4 py-12 text-center sm:px-6 sm:py-14"
        >
          <p class="text-lg font-semibold text-ink">No results found</p>
          <p class="mt-2 max-w-md text-sm text-dusk/70">
            Try a different keyword, or clear the search and explore another category.
          </p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              class="min-h-[44px] rounded-full bg-ink px-4 py-2 text-sm font-medium text-sand transition hover:opacity-90"
              type="button"
              @click="clearSearch"
            >
              Clear search
            </button>
            <button
              class="min-h-[44px] rounded-full border border-dusk/20 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand/70"
              type="button"
              @click="resetFilters"
            >
              Reset filters
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import SearchBar from './components/SearchBar.vue'
import Sidebar from './components/Sidebar.vue'
import ResourceCard from './components/ResourceCard.vue'
import { mockResources } from './data/mockData'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { ResourceItem } from './types/resource'

const resources = ref<ResourceItem[]>(mockResources)
const query = ref('')
const mainRef = ref<HTMLElement | null>(null)

// Move focus for keyboard and screen-reader users after skip link activation.
const skipToMain = () => {
  const el = mainRef.value
  if (!el) return
  el.focus({ preventScroll: true })
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const { storedValue: persistedCategory } = useLocalStorage<string>('hub-category', 'All')
const activeCategory = ref(persistedCategory.value)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const categories = computed(() => {
  const base = new Set<string>()
  resources.value.forEach((item) => item.tags.forEach((tag) => base.add(tag)))
  return ['All', ...Array.from(base)]
})

const filteredResources = computed(() => {
  const category = activeCategory.value
  const base =
    category === 'All'
      ? resources.value
      : resources.value.filter((item) => item.tags.includes(category))

  const q = normalizedQuery.value
  if (!q) return base

  return base.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(q)
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(q))
    return titleMatch || tagMatch
  })
})

const handleCategorySelect = (category: string) => {
  activeCategory.value = category
  persistedCategory.value = category
}

const clearSearch = () => {
  query.value = ''
}

const resetFilters = () => {
  query.value = ''
  activeCategory.value = 'All'
  persistedCategory.value = 'All'
}

watchEffect(() => {
  if (!categories.value.includes(activeCategory.value)) {
    activeCategory.value = 'All'
  }
})
</script>
