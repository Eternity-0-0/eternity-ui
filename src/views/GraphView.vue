<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as d3 from 'd3'
import ELK from 'elkjs/lib/elk.bundled.js'
import type { GraphData, NodeShape } from '@/models/GraphData'
import { fetchGraphData } from '@/services/api'
import { computeArrowPoints } from '@/services/arrowHelper'
import { computeGraphLayout } from '@/services/layout_graph'
import { resolveGraphShapes } from '@/services/resolve_graph_shapes'

const props = defineProps<{
  graphName: string
}>()

const container = ref<HTMLElement | null>(null)

interface MarkerConfig {
  id: string
  refX: number
}

const markerConfigs: Record<NodeShape | 'cofactor', MarkerConfig> = {
  'ellipse': { id: 'arrow-entity', refX: 8 },
  'rectangle': { id: 'arrow-process', refX: 8 },
  'octagon': { id: 'arrow-effect', refX: 8 },
  'cofactor': { id: 'arrow-cofactor', refX: 8 }
}

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

  // Create a group for zoom/pan
  const g = svg.append('g')

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom as any)

  // Add arrow marker definitions
  const defs = svg.append('defs')

  // Add overlay blur filter
  const overlayFilter = defs.append('filter')
    .attr('id', 'overlay-blur')
    .attr('width', '200%')
    .attr('height', '200%')
    .attr('x', '-50%')
    .attr('y', '-50%');
  overlayFilter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', '2');

  Object.entries(markerConfigs).forEach(([_, config]) => {
    defs.append('marker')
      .attr('id', config.id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', config.refX)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--edge-color-dark)')
  })

  // Draw edges
  const links = g.selectAll('path')
    .data(graphWithLayout.edges)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'var(--edge-color-dark)')
    .attr('stroke-width', 1.5)
    .attr('d', d => {
      const sourceNode = graphWithLayout.nodes.find(n => n.id === d.source)
      const targetNode = graphWithLayout.nodes.find(n => n.id === d.target)
      if (!sourceNode?.center || !targetNode?.center) return ''

      try {
        const points = computeArrowPoints(sourceNode, targetNode)
        return `M ${points.start.x},${points.start.y} L ${points.end.x},${points.end.y}`
      } catch (e: any) {
        return `M ${sourceNode.center.x},${sourceNode.center.y} L ${targetNode.center.x},${targetNode.center.y}`
      }
    })
    .attr('marker-end', d => {
      const targetNode = graphWithLayout.nodes.find(n => n.id === d.target)
      if (!targetNode) return 'url(#arrow-entity)'
      
      if (targetNode.entity_subtype === 'cofactor') {
        return `url(#${markerConfigs.cofactor.id})`
      }
      
      return `url(#${markerConfigs[targetNode.shape].id})`
    })

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
    if (d.entity_subtype !== 'cofactor') {
      if (d.type === 'process') {
        node.append('rect')
          .attr('width', 140)
          .attr('height', 60)
          .attr('x', -70)
          .attr('y', -30)
          .attr('fill', 'var(--node-background-color-dark)')
          .attr('stroke', 'var(--node-stroke-color-dark)')
          .attr('stroke-width', 'var(--node-stroke-width)')
          .attr('rx', 5)
      } else if (d.type === 'entity') {
        node.append('ellipse')
          .attr('rx', 70)
          .attr('ry', 30)
          .attr('fill', 'var(--node-background-color-dark)')
          .attr('stroke', 'var(--node-stroke-color-dark)')
          .attr('stroke-width', 'var(--node-stroke-width)')
      } else if (d.type === 'effect') {
        const points = octagonPoints(70, 30)
        node.append('polygon')
          .attr('points', points)
          .attr('fill', 'var(--node-background-color-dark)')
          .attr('stroke', 'var(--node-stroke-color-dark)')
          .attr('stroke-width', 'var(--node-stroke-width)')
      }
    }
  })

  // Add node labels
  nodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em')
    .attr('font-family', 'var(--font-family)')
    .attr('fill', 'var(--text-color-dark)')
    .text(d => (d.status ? `${d.nice_name}: ${d.status}` : d.nice_name) || '')
    .each(function(d: any) {
      const text = d3.select(this);
      let fontSize = d.entity_subtype === 'cofactor' ? 14 : 16;
      const minFontSize = 8;
      const maxWidth = 120;
      const maxHeight = 50; // Maximum height for text (node height - padding)
      const lineHeight = 1.2;
      
      // Function to wrap and measure text
      function wrapAndMeasure() {
        // Store original text and clear existing tspans
        const originalText = text.text();
        text.text(null);
        
        // Split by spaces but preserve them
        const words = originalText.match(/\S+|\s+/g) || [];
        let line: string[] = [];
        let lineCount = 0;
        let tspan = text.append('tspan').attr('x', 0);
        
        for (let word of words) {
          line.push(word);
          tspan.text(line.join(''));  // Join without extra space since spaces are preserved in words
          if (tspan.node()!.getComputedTextLength() > maxWidth) {
            line.pop();
            if (line.length) {
              tspan.text(line.join(''));
              line = [word];
              tspan = text.append('tspan').attr('x', 0).attr('dy', lineHeight + 'em').text(word);
              lineCount++;
            }
          }
        }
        
        // Handle the last line if it's not empty
        if (line.length > 0 && tspan.text() !== line.join('')) {
          tspan.text(line.join(''));
        }
        
        return {
          width: Math.max(...Array.from(text.selectAll('tspan').nodes())
            .map(node => (node as SVGTextElement).getComputedTextLength())),
          height: (lineCount + 1) * lineHeight * fontSize
        };
      }
      
      // Initial font size
      text.attr('font-size', fontSize + 'px');
      let metrics = wrapAndMeasure();
      
      // Adjust font size if text is too tall or any line is too wide
      while ((metrics.height > maxHeight || metrics.width > maxWidth) && fontSize > minFontSize) {
        fontSize--;
        text.attr('font-size', fontSize + 'px');
        metrics = wrapAndMeasure();
      }
      
      // Final wrapping with adjusted font size
      const totalLines = text.selectAll('tspan').size();
      const totalHeight = totalLines * lineHeight;
      const startY = -(totalHeight / 2) + (lineHeight / 2);
      
      // Adjust vertical positions of all tspans
      text.selectAll('tspan')
        .attr('dy', (_, i) => {
          if (i === 0) return startY + 0.3 + 'em';
          return lineHeight + 'em';
        });
    })

  // Add neon effect overlays
  nodes.each(function(d: any) {
    if (d.entity_subtype === 'cofactor') return;
    const nodeSel = d3.select(this);
    if (d.type === 'process') {
      nodeSel.append('rect')
        .attr('width', 140)
        .attr('height', 60)
        .attr('x', -70)
        .attr('y', -30)
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 'var(--node-stroke-width)')
        .attr('filter', 'url(#overlay-blur)')
        .attr('rx', 5);
    } else if (d.type === 'entity') {
      nodeSel.append('ellipse')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('rx', 70)
        .attr('ry', 30)
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 'var(--node-stroke-width)')
        .attr('filter', 'url(#overlay-blur)');
    } else if (d.type === 'effect') {
      const points = octagonPoints(70, 30);
      nodeSel.append('polygon')
        .attr('points', points)
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 'var(--node-stroke-width)')
        .attr('filter', 'url(#overlay-blur)');
    }
  });

  // Center the graph
  const bounds = g.node()?.getBBox()
  if (bounds) {
    const scale = Math.min(width / bounds.width, height / bounds.height) * 0.99
    const tx = (width - bounds.width * scale) / 2 - bounds.x * scale
    const ty = (height - bounds.height * scale) / 2 - bounds.y * scale
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(scale))
  }
})

function octagonPoints(width: number, height: number): string {
  const w = width * 0.3
  const points = [
    [-width + w, -height],
    [width - w, -height],
    [width, -height + w],
    [width, height - w],
    [width - w, height],
    [-width + w, height],
    [-width, height - w],
    [-width, -height + w]
  ]
  return points.map(p => p.join(',')).join(' ')
}
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