<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape from 'cytoscape'
import ELK from 'elkjs/lib/elk.bundled.js'

interface Node {
  id: string
  nice_name: string
  type: string
  group?: string
  status?: string
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

  // Get unique groups
  const groups = [...new Set(data.nodes.filter(node => node.group).map(node => node.group))]

  // Prepare ELK-compatible data structure, with hierarchical grouping
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'POLYLINE',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      // 'elk.layered.layering.strategy': 'LONGEST_PATH',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: [
      // Add group nodes first
      ...groups.map(group => ({
        id: `group-${group}`,
        layoutOptions: {
          'elk.padding': '[top=20,left=20,bottom=20,right=20]'
        },
        children: data.nodes
          .filter(node => node.group === group)
          .map(node => ({
            id: node.id,
            width: 140,
            height: 80,
            type: node.type,
            label: node.nice_name
          }))
      })),
      // Add ungrouped nodes
      ...data.nodes
        .filter(node => !node.group)
        .map(node => ({
          id: node.id,
          width: 140,
          height: 80,
          type: node.type,
          label: node.nice_name
        }))
    ],
    edges: data.edges.map(edge => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }

  // Compute layout with ELK for node positions
  const elkLayout = await elk.layout(elkGraph)

  // Create node position map from ELK layout, including group positions
  const nodePositions = new Map<string, { x: number; y: number }>()
  
  // Add group positions
  elkLayout.children?.forEach(child => {
    if ('children' in child) {
      // This is a group
      nodePositions.set(child.id, {
        x: child.x || 0,
        y: child.y || 0
      })
      // Add positions for nodes in this group
      child.children?.forEach(node => {
        nodePositions.set(node.id, {
          x: (child.x || 0) + (node.x || 0),
          y: (child.y || 0) + (node.y || 0)
        })
      })
    } else {
      // This is an ungrouped node
      nodePositions.set(child.id, {
        x: child.x || 0,
        y: child.y || 0
      })
    }
  })

  // Initialize Cytoscape
  const cy = cytoscape({
    container: container.value,
    elements: [
      // Group compound nodes
      ...groups.map(group => ({
        data: { 
          id: `group-${group}`,
          label: group
        },
        classes: ['group-node']
      })),
      // Nodes
      ...data.nodes.map(node => ({
        data: {
          id: node.id,
          label: node.status ? `${node.nice_name}: ${node.status}` : node.nice_name,
          type: node.type,
          group: node.group,
          parent: node.group ? `group-${node.group}` : undefined
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
        selector: '.group-node',
        style: {
          'shape': 'rectangle',
          'background-color': '#f0f0f0',
          'border-color': '#ddd',
          'border-width': 2,
          'padding': 20,
          'text-valign': 'top',
          'text-halign': 'center',
          'label': 'data(label)',
          'font-size': '16px',
          'font-weight': 'bold',
          'compound-sizing-wrt-labels': 'include'
        }
      },
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
        selector: 'node[type="effect"]',
        style: {
          'shape': 'diamond',
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