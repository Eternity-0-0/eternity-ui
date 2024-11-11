<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape from 'cytoscape'
import ELK from 'elkjs/lib/elk.bundled.js'

interface Node {
  id: string
  nice_name: string
  type: string
  group: string
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

// Add props definition
const props = defineProps<{
  graphName: string
}>()

const container = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!container.value) return

  const response = await fetch(`http://localhost:8000/graphs/${props.graphName}`)
  const data: GraphData = await response.json()

  const elk = new ELK()

  // Group nodes by their group property
  const groupedNodes = data.nodes.reduce((acc, node) => {
    if (!acc[node.group]) {
      acc[node.group] = []
    }
    acc[node.group].push(node)
    return acc
  }, {} as Record<string, Node[]>)

  // Prepare ELK-compatible data structure with clustering
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]'
    },
    children: Object.entries(groupedNodes).map(([groupName, nodes]) => ({
      id: `cluster_${groupName}`,
      layoutOptions: {
        'elk.padding': '[top=20,left=20,bottom=20,right=20]'
      },
      children: nodes.map(node => ({
        id: node.id,
        width: 140,
        height: 80,
        type: node.type,
        label: node.nice_name,
        group: node.group
      })),
      labels: [{
        text: groupName,
        width: 100,
        height: 30
      }]
    })),
    edges: data.edges.map(edge => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }

  // Compute layout with ELK for node positions
  const elkLayout = await elk.layout(elkGraph)

  // Create node position map from ELK layout, accounting for cluster positions
  const nodePositions = new Map<string, { x: number; y: number }>()
  elkLayout.children?.forEach(cluster => {
    const clusterX = cluster.x || 0
    const clusterY = cluster.y || 0
    cluster.children?.forEach(node => {
      nodePositions.set(node.id, {
        x: clusterX + (node.x || 0),
        y: clusterY + (node.y || 0)
      })
    })
  })

  // Initialize Cytoscape
  const cy = cytoscape({
    container: container.value,
    elements: [
      // Nodes
      ...data.nodes.map(node => ({
        data: {
          id: node.id,
          label: `${node.nice_name}\n(${node.group})`,
          type: node.type,
          group: node.group
        },
        position: {
          x: nodePositions.get(node.id)?.x || 0,
          y: nodePositions.get(node.id)?.y || 0
        }
      })),
      // Edges
      ...data.edges.map(edge => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        }
      }))
    ],
    style: [
      {
        selector: 'node[type="process"]',
        style: {
          'shape': 'rectangle',
          'background-color': '#ffffff',
          'border-color': '#666',
          'border-width': 1.5,
          'width': 150,
          'height': 60,
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': 140,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '14px'
        }
      },
      {
        selector: 'node[type="entity"]',
        style: {
          'shape': 'ellipse',
          'background-color': '#ffffff',
          'border-color': '#666',
          'border-width': 1.5,
          'width': 120,
          'height': 60,
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': 110,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '14px'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#aaa',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#aaa',
          'arrow-scale': 1.5
        }
      }
    ],
    userZoomingEnabled: true,
    userPanningEnabled: true,
    layout: { name: 'preset' }
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
  min-height: 800px;
  background-color: #f5f8fb;
}
</style>