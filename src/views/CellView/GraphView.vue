<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape from 'cytoscape'

const container = ref<HTMLElement | null>(null)
let cy: cytoscape.Core | null = null

interface Node {
  name: string
  nice_name: string
  type: string
}

interface Edge {
  source: string
  target: string
}

interface GraphData {
  name: string
  nice_name: string
  nodes: Node[]
  edges: Edge[]
}

onMounted(async () => {
  if (!container.value) return

  const response = await fetch('http://localhost:8000/graphs/carbohydrates_catabolism')
  const data: GraphData = await response.json()

  const elements = [
    ...data.nodes.map(node => ({
      data: {
        id: node.name,
        label: node.nice_name,
        type: node.type
      }
    })),
    ...data.edges.map(edge => ({
      data: {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target
      }
    }))
  ]

  cy = cytoscape({
    container: container.value,
    elements,
    style: [
      {
        selector: 'node[type="entity"]',
        style: {
          'background-color': '#666',
          'label': 'data(label)',
          'width': 'label',
          'height': 'label',
          'padding': '20px',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'shape': 'ellipse',
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: 'node[type="process"]',
        style: {
          'background-color': '#666',
          'label': 'data(label)',
          'width': 'label',
          'height': 'label',
          'padding': '20px',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'shape': 'round-rectangle',
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#ccc'
        }
      }
    ],
    layout: {
      name: 'cose'
    }
  })
})
</script>

<template>
  <div ref="container" class="graph-container"></div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
