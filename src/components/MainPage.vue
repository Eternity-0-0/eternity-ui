<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
        <WikiPage />
      </div>
      <div class="graph-container">
        <Graph v-if="graphData" :graph-data="graphData" />
      </div>
    </div>
  </HexBackground>
</template>

<script setup lang="ts">
import HexBackground from './HexBackground.vue'
import WikiPage from './wiki/WikiPage.vue'
import Graph from './graph/Graph.vue'
import { ref, onMounted } from 'vue'
import type { GraphData } from '@/models/GraphData'


const graphData = ref<GraphData | null>(null)

onMounted(async () => {
  const response = await fetch(`http://localhost:8000/graphs/epinephrine`)
  graphData.value = await response.json()
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
