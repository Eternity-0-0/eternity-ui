<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
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

const props = defineProps<{
  name: string
}>()

const componentData = ref<ComponentData | null>(null)


onMounted(async () => {
  const response = await fetch(`http://localhost:8000/entities/${props.name}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  componentData.value = await response.json() as ComponentData
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
}

.graph-container {
  width: 50%;
  height: 100%;
}
</style>
