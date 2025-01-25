<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
        <Search 
          v-if="searchOptions.length"
          :options="searchOptions" 
          class="search-bar"
        />
        <WikiPage v-if="componentData" :component-data="componentData" />
        <div v-else>Loading...</div>
      </div>
    </div>
  </HexBackground>
</template>

<script setup lang="ts">
import HexBackground from '@/components/HexBackground.vue'
import WikiPage from '@/components/wiki/WikiPage.vue'
import { ref, onMounted } from 'vue'
import type { ComponentData } from '@/models/ComponentData'
import Search from '@/components/search/Search.vue'
import { SearchSuggestion } from '@/models/SearchSuggestion'
const props = defineProps<{
  name: string
}>()

const componentData = ref<ComponentData | null>(null)
const searchOptions = ref<SearchSuggestion[]>([])

onMounted(async () => {
  // Load component data
  const response = await fetch(`http://localhost:8000/entities/${props.name}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  componentData.value = await response.json() as ComponentData

  // Try to get search suggestions from localStorage
  const storedSuggestions = localStorage.getItem('searchSuggestions')
  if (storedSuggestions) {
    searchOptions.value = JSON.parse(storedSuggestions).map((item: any) => 
      new SearchSuggestion(item.nice_name, item.name, item.short_name)
    )
  } else {
    // Fetch suggestions from API if not in localStorage
    const suggestionsResponse = await fetch('http://localhost:8000/entities')
    if (!suggestionsResponse.ok) {
      throw new Error(`HTTP error! status: ${suggestionsResponse.status}`)
    }
    const entities = await suggestionsResponse.json()
    
    // Filter for well described entities and create SearchSuggestions
    const suggestions = entities
      .filter((entity: any) => entity.is_well_described)
      .map((entity: any) => new SearchSuggestion(
        entity.nice_name,
        entity.name,
        entity.short_name
      ))

    // Store in localStorage for future use
    localStorage.setItem('searchSuggestions', JSON.stringify(entities.filter((e: any) => e.is_well_described)))
    searchOptions.value = suggestions
  }
})

</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.wiki-container {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.search-bar {
  margin-bottom: 0px;
}
</style>
