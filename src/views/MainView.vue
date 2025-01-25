<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
        <Search 
          v-if="searchOptions.length"
          :options="searchOptions" 
          class="search-bar"
          @search="handleSearch"
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
import { loadSearchSuggestions } from '@/services/loading'
import { fetchComponentData } from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps<{
  name: string
}>()

const componentData = ref<ComponentData | null>(null)
const searchOptions = ref<SearchSuggestion[]>([])

const handleSearch = async (suggestion: SearchSuggestion) => {
  await router.push(`/wiki/${suggestion.name}`)
  componentData.value = await fetchComponentData(suggestion.name)
}

onMounted(async () => {
  componentData.value = await fetchComponentData(props.name)

  // Load search suggestions
  searchOptions.value = await loadSearchSuggestions()
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
