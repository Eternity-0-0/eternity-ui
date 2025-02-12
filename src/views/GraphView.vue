<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as d3 from 'd3'
import { fetchGraphData } from '@/services/api'
import { computeGraphLayout } from '@/services/layout_graph'
import { resolveGraphShapes } from '@/services/resolve_graph_shapes'
import { renderNode, renderNeonEffect } from '@/services/node_renderer'
import { wrapAndSizeText } from '@/services/text_wrapper'
import { setupArrowMarkers, renderEdges } from '@/services/edge_renderer'
import { setupSvgDefs } from '@/services/svg_defs'
import { centerAndScaleGraph } from '@/services/graph_layout_helper'
import { TEXT_CONFIG, NODE_SIZES } from '@/constants/graph'

const props = defineProps<{
  graphName: string
}>()

const container = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!container.value) return

  const data = await fetchGraphData(props.graphName)
  const graphWithShapes = resolveGraphShapes(data)
  const graphWithLayout = await computeGraphLayout(graphWithShapes)

  // Initialize D3
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // Clear any existing SVG
  d3.select(container.value).selectAll('*').remove()

  const svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  const g = svg.append('g')

  // Setup SVG definitions (filters, markers)
  const defs = setupSvgDefs(svg)
  setupArrowMarkers(defs)

  // Draw edges
  renderEdges(g, graphWithLayout.edges, graphWithLayout.nodes)

  // Draw nodes
  const nodes = g.selectAll('g.node')
    .data(graphWithLayout.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.center?.x || 0},${d.center?.y || 0})`)

  // Add different shapes based on node type
  nodes.each(function(d) {
    const node = d3.select(this)
    
    // Determine colors based on direction
    let fillColor = 'var(--node-background-color-dark)'  // Always use default background
    let strokeColor = 'var(--node-stroke-color-dark)'
    let neonColor = 'white'
    
    if (d.direction === 'up') {
      strokeColor = 'var(--node-up-stroke-color-dark)'
      neonColor = 'var(--node-up-neon-color-dark)'
    } else if (d.direction === 'down') {
      strokeColor = 'var(--node-down-stroke-color-dark)'
      neonColor = 'var(--node-down-neon-color-dark)'
    }
    
    renderNode(node, d, {
      width: d.shape === 'point' ? NODE_SIZES.POINT.width + 2 : NODE_SIZES.STANDARD.width,
      height: d.shape === 'point' ? NODE_SIZES.POINT.height + 2 : NODE_SIZES.STANDARD.height,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 'var(--node-stroke-width)'
    })
  })

  // Add node labels
  nodes.each(function(d) {
    // Skip labels for point shapes
    if (d.shape === 'point') return;

    const node = d3.select(this);
    const text = node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-family', 'var(--font-family)')
      .attr('fill', 'var(--text-color-dark)')

    wrapAndSizeText(text, 
      (d.status ? `${d.nice_name}: ${d.status}` : d.nice_name) || '',
      {
        fontSize: d.entity_subtype === 'cofactor' ? TEXT_CONFIG.FONT_SIZES.COFACTOR : TEXT_CONFIG.FONT_SIZES.STANDARD,
        minFontSize: TEXT_CONFIG.FONT_SIZES.MIN,
        maxWidth: TEXT_CONFIG.DIMENSIONS.MAX_WIDTH,
        maxHeight: TEXT_CONFIG.DIMENSIONS.MAX_HEIGHT,
        lineHeight: TEXT_CONFIG.DIMENSIONS.LINE_HEIGHT
      }
    )
  })

  // Update neon effect overlays with direction-based colors
  nodes.each(function(d) {
    const nodeSel = d3.select(this)
    let neonColor = 'white'
    let neonStrokeWidth = 'var(--node-stroke-width)'
    
    if (d.direction === 'up') {
      neonColor = 'var(--node-up-neon-color-dark)'
    } else if (d.direction === 'down') {
      neonColor = 'var(--node-down-neon-color-dark)'
      neonStrokeWidth = 'calc(var(--node-stroke-width) * 1.5)'  // 50% bigger stroke for red neon
    }
    
    renderNeonEffect(nodeSel, d, {
      width: d.shape === 'point' ? NODE_SIZES.POINT.width + 2 : NODE_SIZES.STANDARD.width,
      height: d.shape === 'point' ? NODE_SIZES.POINT.height + 2 : NODE_SIZES.STANDARD.height,
      fill: 'none',
      stroke: neonColor,
      strokeWidth: neonStrokeWidth
    })
  })

  // Center and scale the graph
  centerAndScaleGraph(g, { width, height })
})
</script>

<template>
  <div ref="container" class="graph-container"></div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  min-height: 100%;
  flex: 1;
}
</style>