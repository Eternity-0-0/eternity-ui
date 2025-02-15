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
import NodeComment from '@/components/graph/NodeComment.vue'
import type { Node as GraphNode } from '@/models/GraphData'

const props = defineProps<{
  graphName: string
}>()

const container = ref<HTMLElement | null>(null)

// Reactive variables for node comment tooltip
const hoverComment = ref("")
const hoverX = ref(0)
const hoverY = ref(0)

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

  // Add specific filter for comment indicator
  defs.append('filter')
    .attr('id', 'commentGlow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%')
    .append('feGaussianBlur')
    .attr('stdDeviation', '1')
    .attr('result', 'coloredBlur')

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
      neonStrokeWidth = 'calc(var(--node-stroke-width) * 1.5)'
    }
    
    renderNeonEffect(nodeSel, d, {
      width: d.shape === 'point' ? NODE_SIZES.POINT.width + 2 : NODE_SIZES.STANDARD.width,
      height: d.shape === 'point' ? NODE_SIZES.POINT.height + 2 : NODE_SIZES.STANDARD.height,
      fill: 'none',
      stroke: neonColor,
      strokeWidth: neonStrokeWidth
    })
  })

  // Add comment indicators after neon effects
  nodes.each(function(d) {
    if (d.comment && (d.shape === 'rectangle' || d.shape === 'ellipse')) {
      const node = d3.select(this)
      const nodeWidth = NODE_SIZES.STANDARD.width
      const nodeHeight = NODE_SIZES.STANDARD.height
      
      // Calculate position on the border
      let cx, cy
      if (d.shape === 'rectangle') {
        // For rectangle, position slightly to the left of the corner
        cx = nodeWidth / 2 - 16
        cy = -nodeHeight / 2
      } else {
        // For ellipse, position on the ellipse border at approximately 45 degrees
        const t = Math.PI / 4
        cx = (nodeWidth / 2) * Math.cos(t)
        cy = -(nodeHeight / 2) * Math.sin(t)
      }
      
      // Add the glow circle first (it will be behind)
      node.append('circle')
        .attr('class', 'comment-indicator-glow')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3.0)
        .attr('fill', 'white')
        .style('filter', 'url(#commentGlow)')
        
      // Add the solid white circle on top
      node.append('circle')
        .attr('class', 'comment-indicator')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3.0)
        .attr('fill', 'white')
    }
  })

  const { scale, tx, ty } = centerAndScaleGraph(g, { width, height })

  // Add hover event listeners for nodes with a comment to show NodeComment tooltip
  nodes.filter((d: GraphNode) => !!d.comment)
    .on('mouseover', function(event: MouseEvent, d: GraphNode) {
      const nodeWidth = NODE_SIZES.STANDARD.width
      const nodeHeight = NODE_SIZES.STANDARD.height
      let cx: number, cy: number
      if (d.shape === 'rectangle') {
        cx = nodeWidth / 2 - 16
        cy = -nodeHeight / 2
      } else {
        const t = Math.PI / 4
        cx = (nodeWidth / 2) * Math.cos(t)
        cy = -(nodeHeight / 2) * Math.sin(t)
      }
      hoverComment.value = d.comment!  // d.comment exists, use non-null assertion
      hoverX.value = ((d.center && d.center.x ? d.center.x : 0) + cx) * scale + tx
      hoverY.value = ((d.center && d.center.y ? d.center.y : 0) + cy) * scale + ty
      console.log('Hover coordinates:', { x: hoverX.value, y: hoverY.value })
    })
    .on('mouseout', function() {
      hoverComment.value = ""
    })
})
</script>

<template>
  <div ref="container" class="my-graph-container">
    <!-- NodeComment tooltip overlay -->
    <NodeComment 
      v-if="hoverComment"
      :comment="hoverComment"
      :style="{ left: hoverX + 'px', top: hoverY + 'px', position: 'absolute' }"
    />
  </div>
</template>

<style scoped>
.my-graph-container {
  width: 100%;
  height: 100%;
  min-height: 100%;
  position: relative; /* Ensure tooltip is positioned relative to container */
}
</style>