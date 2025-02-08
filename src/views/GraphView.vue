<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as d3 from 'd3'
import { fetchGraphData } from '@/services/api'
import { computeGraphLayout } from '@/services/layout_graph'
import { resolveGraphShapes } from '@/services/resolve_graph_shapes'
import { renderNode, renderNeonEffect } from '@/services/node_renderer'
import { wrapAndSizeText } from '@/services/text_wrapper'
import { setupArrowMarkers, renderEdges } from '@/services/edge_renderer'
import { FILTER_CONFIG, TEXT_CONFIG, LAYOUT_CONFIG, NODE_SIZES } from '@/constants/graph'

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

  // Add definitions
  const defs = svg.append('defs')

  // Add overlay blur filter
  const overlayFilter = defs.append('filter')
    .attr('id', 'overlay-blur')
    .attr('width', FILTER_CONFIG.BLUR.DIMENSIONS.width)
    .attr('height', FILTER_CONFIG.BLUR.DIMENSIONS.height)
    .attr('x', FILTER_CONFIG.BLUR.DIMENSIONS.x)
    .attr('y', FILTER_CONFIG.BLUR.DIMENSIONS.y)
  overlayFilter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', FILTER_CONFIG.BLUR.STD_DEVIATION)

  // Setup arrow markers
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
    renderNode(node, d, {
      width: d.shape === 'point' ? NODE_SIZES.POINT.width + 2 : NODE_SIZES.STANDARD.width,
      height: d.shape === 'point' ? NODE_SIZES.POINT.height + 2 : NODE_SIZES.STANDARD.height,
      fill: 'var(--node-background-color-dark)',
      stroke: 'var(--node-stroke-color-dark)',
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

  // Add neon effect overlays
  nodes.each(function(d) {
    const nodeSel = d3.select(this)
    renderNeonEffect(nodeSel, d, {
      width: d.shape === 'point' ? NODE_SIZES.POINT.width + 2 : NODE_SIZES.STANDARD.width,
      height: d.shape === 'point' ? NODE_SIZES.POINT.height + 2 : NODE_SIZES.STANDARD.height,
      fill: 'none',
      stroke: 'white',
      strokeWidth: 'var(--node-stroke-width)'
    })
  })

  // Move centering code to after all elements are drawn
  const bounds = g.node()?.getBBox()
  if (bounds) {
    const scale = Math.min(width / bounds.width, height / bounds.height) * LAYOUT_CONFIG.SCALE_PADDING
    const tx = (width - bounds.width * scale) / 2 - bounds.x * scale
    const ty = (height - bounds.height * scale) / 2 - bounds.y * scale
    g.attr('transform', `translate(${tx}, ${ty}) scale(${scale})`)
  }
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