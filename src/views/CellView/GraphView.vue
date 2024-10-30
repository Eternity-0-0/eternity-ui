<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay';
import elk from 'cytoscape-elk';


cytoscape.use(klay);
cytoscape.use(elk);


const container = ref<HTMLElement | null>(null)
let cy: cytoscape.Core | null = null

interface Node {
  id: string
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
        id: node.id,
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
          'background-color': '#ffffff',
          'border-width': '1px',
          'border-color': '#666',
          'label': 'data(label)',
          'width': '120px',
          'height': '80px',
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
          'background-color': '#ffffff',
          'border-width': '1px', 
          'border-color': '#666',
          'label': 'data(label)',
          'width': '150px',
          'height': '60px',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'shape': 'roundrectangle',
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
      // name: 'klay'
      // name: 'dagre'
      name: 'elk',
      elk: {
        algorithm: 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': 50,
        'elk.layered.spacing.nodeNode': 50,
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.edges.orthogonalRouting': true,
        'elk.edges.edgeRouting': 'ORTHOGONAL',
        'elk.edges.orthogonal': true
      }
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
