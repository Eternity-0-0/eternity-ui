<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape from 'cytoscape'
import ELK from 'elkjs/lib/elk.bundled.js'


// Props definition
const props = defineProps<{
  graphData: GraphData
}>()

const container = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!container.value) return

  const elk = new ELK()

  console.log(props.graphData)
  // Get unique groups
  const groups = [...new Set(props.graphData.nodes.filter(node => node.group).map(node => node.group))]

  // Prepare ELK-compatible data structure, with hierarchical grouping
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '40',
      'elk.padding': '[top=25,left=25,bottom=25,right=25]',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'POLYLINE',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: [
      // Add group nodes first
      ...groups.map(group => ({
        id: `group-${group}`,
        layoutOptions: {
          'elk.padding': '[top=15,left=15,bottom=15,right=15]'
        },
        children: props.graphData.nodes
          .filter(node => node.group === group)
          .map(node => ({
            id: node.id,
            width: 140,
            height: 60,
            type: node.type,
            label: node.nice_name
          }))
      })),
      // Add ungrouped nodes
      ...props.graphData.nodes
        .filter(node => !node.group)
        .map(node => ({
          id: node.id,
          width: 140,
          height: 60,
          type: node.type,
          label: node.nice_name
        }))
    ],
    edges: props.graphData.edges.map(edge => ({
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

  // Get computed styles for CSS variables
  const computedStyle = getComputedStyle(document.documentElement)
  const nodeBackgroundColor = computedStyle.getPropertyValue('--node-background-color-dark')
  const nodeStrokeColor = computedStyle.getPropertyValue('--node-stroke-color-dark')
  const textColor = computedStyle.getPropertyValue('--text-color-dark')
  const edgeColor = computedStyle.getPropertyValue('--edge-color-dark')

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
      ...props.graphData.nodes.map(node => ({
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
      ...props.graphData.edges.map(edge => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        }
      }))
    ],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': nodeBackgroundColor,
          'border-color': nodeStrokeColor,
          'border-width': 1.5,
          'width': 140,
          'height': 60,
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': 130,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '16px',
          'color': textColor
        }
      },
      {
        selector: 'node[type="process"]',
        style: {
          'shape': 'rectangle',
        }
      },
      {
        selector: 'node[type="entity"]',
        style: {
          'shape': 'ellipse',
        }
      },
      {
        selector: 'node[type="effect"]',
        style: {
          'shape': 'cut-rectangle',
        }
      },
      {
        selector: '.group-node',
        style: {
          'shape': 'rectangle',
          'background-color': nodeBackgroundColor,
          'border-color': nodeStrokeColor,
          'border-width': 2,
          'padding': 10,
          'text-valign': 'top',
          'text-halign': 'center',
          'label': 'data(label)',
          'font-size': '16px',
          'font-weight': 'bold',
          'compound-sizing-wrt-labels': 'include'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1.0,
          'line-color': edgeColor,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': edgeColor,
          'arrow-scale': 1.5
        }
      }
    ],
    userZoomingEnabled: true,
    userPanningEnabled: true,
    layout: { name: 'preset' }
  })

  // Fit the graph to the container
  cy.fit()
  cy.center()
})
</script>

<template>
  <div ref="container" class="graph"></div>
</template>

<style scoped>
.graph {
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>