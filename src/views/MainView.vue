<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
        <WikiPage />
      </div>
      <div class="graph-container">
        <Graph v-if="graphData" :graph-data="graphData" @node-click="handleNodeClick" />
      </div>
    </div>
  </HexBackground>
</template>

<script setup lang="ts">
import HexBackground from '@/components/HexBackground.vue'
import WikiPage from '@/components/wiki/WikiPage.vue'
import Graph from '@/components/graph/Graph.vue'
import { ref, onMounted } from 'vue'
import type { GraphData } from '@/models/GraphData'


const graphData = ref<GraphData | null>(null)

const handleNodeClick = (nodeName: string) => {
  console.log(nodeName)
}

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
